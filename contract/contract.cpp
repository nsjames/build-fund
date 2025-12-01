#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/system.hpp>
using namespace eosio;

CONTRACT bfp : public contract {
   public:
      using contract::contract;

      static constexpr symbol BURNED_SYMBOL = symbol("BURNED", 4);
      static constexpr int64_t BYTES_PER_BURN_ROW = 40;

      TABLE Proposal {
         uint64_t id;
         name proposer;
         std::string title;
         std::string summary;
         std::string markdown;
         asset requested;
         name msig;
         asset burns;
         time_point_sec timestamp;

         uint64_t primary_key() const {
            return id;
         }

         // by requested amount
         uint64_t by_requested() const {
            return requested.amount;
         }

         // by burns amount
         uint64_t by_burns() const {
            return burns.amount;
         }

         // by date
         uint64_t by_timestamp() const {
            return timestamp.sec_since_epoch();
         }
      };

      using proposals_table = multi_index<"proposals"_n, Proposal,
         indexed_by<"byrequested"_n, const_mem_fun<Proposal, uint64_t, &Proposal::by_requested>>,
         indexed_by<"byburns"_n, const_mem_fun<Proposal, uint64_t, &Proposal::by_burns>>,
         indexed_by<"bytimestamp"_n, const_mem_fun<Proposal, uint64_t, &Proposal::by_timestamp>>
      >;

      TABLE ChatMessage {
         uint64_t id;
         asset burned;
         name sender;
         std::string message;
         time_point_sec timestamp;

         uint64_t primary_key() const {
            return id;
         }

         // by latest timestamp first
         uint64_t by_timestamp() const {
            return UINT64_MAX - timestamp.sec_since_epoch();
         }
      };

      using chat_table = multi_index<"chatmsgs"_n, ChatMessage,
         indexed_by<"bytimestamp"_n, const_mem_fun<ChatMessage, uint64_t, &ChatMessage::by_timestamp>>
      >;

      TABLE Burned {
         name burner;
         asset quantity;

         uint64_t primary_key() const {
            return burner.value;
         }
      };

      using burned_table = multi_index<"burned"_n, Burned>;

      struct LimitedProposal {
         uint64_t id;
         name proposer;
         std::string title;
         std::string summary;
         asset requested;
         asset burns;
         time_point_sec timestamp;
         uint8_t approvals;
         name msig;
      };

      struct GetProposalsResult {
         std::vector<LimitedProposal> proposals;
      };

      struct GetProposalResult {
         Proposal proposal;
         uint8_t approvals;
      };

      struct GetComments {
         std::vector<ChatMessage> comments;
      };

      struct approval {
         permission_level level;
         time_point       time;
      };
      struct approvals_info {
         uint8_t                 version = 1;
         name                    proposal_name;
         std::vector<approval>   requested_approvals;
         std::vector<approval>   provided_approvals;
         uint64_t primary_key()const { return proposal_name.value; }
      };
      typedef eosio::multi_index< "approvals2"_n, approvals_info > approvals;

      [[eosio::action, eosio::read_only]]
      GetComments getcomments(uint64_t id, uint32_t limit = 10, uint32_t offset = 0) {
         if (limit > 50) limit = 50;

         // get by timestamp
         chat_table chat(get_self(), id);
         auto idx = chat.get_index<"bytimestamp"_n>();

         GetComments result;
         uint32_t count = 0;
         for (auto itr = idx.begin(); itr != idx.end(); ++itr) {
            if (count >= offset && result.comments.size() < limit) {
               result.comments.push_back(*itr);
            }
            count++;
            if (result.comments.size() >= limit)
               break;
         }

         return result;
      }

      [[eosio::action, eosio::read_only]]
      GetProposalResult getprop(uint64_t id) {
         proposals_table proposals_tbl(get_self(), get_self().value);
         GetProposalResult result;

         auto itr = proposals_tbl.find(id);
         check(itr != proposals_tbl.end(), "Proposal not found");
         result.proposal = *itr;

         approvals approval_table( "eosio.msig"_n, itr->proposer.value );
         auto approval_table_iter = approval_table.find( itr->msig.value );
         if(approval_table_iter != approval_table.end()) {
            result.approvals = static_cast<uint8_t>(approval_table_iter->provided_approvals.size());
         } else {
            result.approvals = 0;
         }
         return result;
      }


      template<typename Index>
      void paginate_index(Index& idx, GetProposalsResult& result,
                          uint32_t offset, uint32_t limit)
      {
          uint32_t count = 0;

          for (auto itr = idx.begin(); itr != idx.end(); ++itr) {
             if (count >= offset && result.proposals.size() < limit) {
                approvals approval_table("eosio.msig"_n, itr->proposer.value);
                auto approval_itr = approval_table.find(itr->msig.value);
                if (approval_itr == approval_table.end()) {
                   // TODO: Should it skip?
                   continue; // skip proposals with no approvals
                }
                result.proposals.push_back(LimitedProposal{
                   itr->id,
                   itr->proposer,
                   itr->title,
                   itr->summary,
                   itr->requested,
                   itr->burns,
                   itr->timestamp,
                   static_cast<uint8_t>(approval_itr->provided_approvals.size()),
                   itr->msig
                });
             }
             count++;
             if (result.proposals.size() >= limit)
                break;
          }
      }

      [[eosio::action, eosio::read_only]]
      GetProposalsResult getprops(uint8_t sort = 0, uint32_t limit = 10, uint32_t offset = 0) {
          if (limit > 50) limit = 50;
          if (sort > 2) sort = 0;

          proposals_table proposals(get_self(), get_self().value);

          GetProposalsResult result;

          // Select correct index
          if (sort == 0) {
              auto idx = proposals.get_index<"byrequested"_n>();
              paginate_index(idx, result, offset, limit);
          } else if (sort == 1) {
              auto idx = proposals.get_index<"byburns"_n>();
              paginate_index(idx, result, offset, limit);
          } else {
              auto idx = proposals.get_index<"bytimestamp"_n>();
              paginate_index(idx, result, offset, limit);
          }

          return result;
      }



      [[eosio::action]]
      uint64_t propose( const name proposer, const std::string& title, const std::string& summary, const asset& requested, const std::string& markdown, const name& msig ){
         require_auth(proposer);

         check(title.size() <= 256, "Title too long");
         check(summary.size() <= 1024, "Summary too long");
         check(requested.amount > 0, "Requested amount must be positive");
         check(markdown.size() >= 0, "Markdown content required");

         proposals_table proposals(get_self(), get_self().value);
         uint64_t id = proposals.available_primary_key();
         proposals.emplace(proposer, [&](auto& row) {
            row.id = id;
            row.proposer = proposer;
            row.title = title;
            row.msig = msig;
            row.summary = summary;
            row.requested = requested;
            row.markdown = markdown;
            row.burns = asset(0, BURNED_SYMBOL);
            row.timestamp = time_point_sec(current_time_point());
         });

         return id;
      }

      ACTION unpropose( uint64_t id ){
         proposals_table proposals(get_self(), get_self().value);
         auto itr = proposals.find(id);
         check(itr != proposals.end(), "Proposal not found");
         require_auth(itr->proposer);
         proposals.erase(itr);
      }


      // Users must buy this contract an exact amount of RAM to cover their burned balance
      // This action sends back RAM to users when they burn their balance
      void send_back_ram(const name& to) {
         action{
            permission_level{get_self(), "active"_n},
            "eosio"_n,
            "ramtransfer"_n,
            std::make_tuple(get_self(), to, BYTES_PER_BURN_ROW, std::string("Return RAM from BFP contract"))
         }.send();
      }

      [[eosio::action]]
      uint64_t burn(const name& burner, const uint64_t& id, const asset& quantity, const std::optional<std::string>& message){
         require_auth(burner);
         check(quantity.amount > 0, "Burn amount must be positive");
         check(quantity.symbol == BURNED_SYMBOL, "Invalid symbol for burned asset");

         proposals_table proposals(get_self(), get_self().value);
         auto proposal = proposals.find(id);
         check(proposal != proposals.end(), "Proposal not found");

         burned_table burned(get_self(), get_self().value);
         auto available = burned.find(burner.value);
         check(available != burned.end(), "No burned records found for this burner");
         check(available->quantity.amount >= quantity.amount, "Insufficient burned balance");

         if(available->quantity.amount == quantity.amount){
            burned.erase(available);
            send_back_ram(burner);
         } else {
            burned.modify(available, same_payer, [&](auto& row){
               row.quantity -= asset(quantity.amount, BURNED_SYMBOL);
            });
         }

         proposals.modify(proposal, same_payer, [&](auto& row){
            row.burns += quantity;
         });

         chat_table chat(get_self(), id);
         auto chat_id = chat.available_primary_key();

         chat.emplace(burner, [&](auto& row){
            row.id = chat_id;
            row.burned = quantity;
            row.sender = burner;
            row.message = message.value_or("");
            row.timestamp = time_point_sec(current_time_point());
         });

         return chat_id;
      }

      void add_burned(const name& burner, const asset& quantity) {
         check(quantity.amount > 0, "Quantity must be positive");

         burned_table burned(get_self(), get_self().value);
         auto itr = burned.find(burner.value);
         if(itr == burned.end()){
            // TODO: Need to handle sending RAM
            burned.emplace(get_self(), [&](auto& row){
               row.burner = burner;
               row.quantity = asset(quantity.amount, BURNED_SYMBOL);
            });
         } else {
            burned.modify(itr, same_payer, [&](auto& row){
               row.quantity += asset(quantity.amount, BURNED_SYMBOL);
            });
         }
      }

      ACTION cancel(uint64_t id) {
         // erase proposal, and chats
         proposals_table proposals(get_self(), get_self().value);
         auto proposal = proposals.find(id);
         check(proposal != proposals.end(), "Proposal not found");
         require_auth(proposal->proposer);
         proposals.erase(proposal);
         chat_table chat(get_self(), id);
         // TODO: Very likely to fail with a large amount of messages...
         auto chat_itr = chat.begin();
         while(chat_itr != chat.end()){
            chat_itr = chat.erase(chat_itr);
         }
      }

      [[eosio::on_notify("eosio.token::transfer")]]
      void ontransfer(const name& from, const name& to, const asset& quantity, const std::string& memo) {
         if(to != get_self() || from == get_self()) return;
         if(from == "eosio.fees"_n) return;
         if(from == "core.vaulta"_n) return;
         if(from == "eosio.ram"_n) return;
         if(from == "eosio.stake"_n) return;

         add_burned(from, quantity);

         // immediately forward the quantity to burn
         action{
            permission_level{get_self(), "active"_n},
            "eosio.token"_n,
            "transfer"_n,
            std::make_tuple(get_self(), "eosio.fees"_n, quantity, std::string("Burned from BFP contract"))
         }.send();
      }

      [[eosio::on_notify("core.vaulta::transfer")]]
      void onvaulttransfer(const name& from, const name& to, const asset& quantity, const std::string& memo) {
         if(to != get_self() || from == get_self()) return;

         add_burned(from, quantity);

         // immediately forward the quantity to burn
         // (need to swap to EOS first)
         action{
            permission_level{get_self(), "active"_n},
            "core.vaulta"_n,
            "swapto"_n,
            std::make_tuple(get_self(), "eosio.fees"_n, quantity, std::string("Burned from BFP contract via vaulta"))
         }.send();
      }


};