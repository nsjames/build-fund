<script lang="ts">
  import Fluid from "$lib/components/Fluid.svelte";
  import ProposalsList from "$lib/components/ProposalsList.svelte";

  const scrollToProposals = () => {
    const proposalsSection = document.getElementById('proposals');
    if (proposalsSection) {
      proposalsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>


<section class="-mb-30">

  <section class="relative px-30 max-lg:px-6 pt-20 pb-20 bg-black pb-80">
    <section class="w-full absolute top-0 bottom-0 left-0 right-0 max-lg:fixed ">
      <figure class="max-lg:hidden fade-to-black"></figure>
      <Fluid forcedConfig={{
                DENSITY_DISSIPATION: 3.5,
                VELOCITY_DISSIPATION: 2.05,
                PRESSURE: 0.6,
                PRESSURE_ITERATIONS: 2,
                CURL: 30.1,
                SPLAT_RADIUS: 0.4,
                SPLAT_FORCE: 20000,
                SHADING: true,
                COLOR_UPDATE_SPEED: 10,
            }} />
    </section>
    <section class="relative pt-30 relative w-full flex justify-center items-center flex-col max-w-3xl mx-auto text-center text-white">
      <figure class="text-sm font-bold italic">
        Roll up your sleeves, nerds.
      </figure>
      <h1 class="text-7xl serif max-lg:text-3xl">
        It's time to save the network... <i>again.</i>
      </h1>

      <figure class="text-md mt-10 max-w-2xl max-lg:text-sm max-lg:mt-4">
        <b>The goal of this site is to promote building products.</b>
        <br />
        Proposals for funding can be submitted by anyone, are amplified by community token burning, and approved by block producers.
      </figure>

      <section class="flex gap-2 text-lg max-lg:flex-col max-lg:gap-1 mt-10">
        <a href="/propose" class="btn-animate cursor-pointer bg-blue-500 text-white  px-6 py-3 rounded-lg font-bold max-lg:text-lg">
          Create Proposal
        </a>
        <button onclick={scrollToProposals} class="cursor-pointer text-white px-6 py-3 rounded-lg font-bold max-lg:text-lg group">
          <span class="group-hover:underline">See Proposals</span> ↓
        </button>
      </section>

    </section>

    <section class="relative px-30 max-lg:px-6 mx-auto text-center mt-20 max-w-5xl">
      <figure class="text-xs font-bold italic text-white/40">
        All products created through this process must be (even this one!):
      </figure>

      <section class="flex gap-x-20 gap-y-5 justify-center relative mt-3 flex-wrap max-lg:mt-10">
        <section class="flex gap-2 items-center">
          <svg class="fill-white/70" width="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M27.939 18.5093C29.1657 17.8177 30 16.5019 30 15C30 13.4981 29.1657 12.1824 27.939 11.4907C26.813 10.8563 26.2831 9.57617 26.6309 8.3317C27.0105 6.97512 26.6691 5.45552 25.6068 4.39323C24.5444 3.33091 23.0248 2.98953 21.6683 3.36912C20.4238 3.71686 19.1437 3.18697 18.5093 2.06096C17.8177 0.834324 16.5019 0 15 0C13.4981 0 12.1824 0.834324 11.4907 2.06096C10.8563 3.18697 9.57617 3.71686 8.3317 3.36912C6.97511 2.98953 5.45552 3.33091 4.39323 4.39323C3.33091 5.45555 2.98953 6.97518 3.36912 8.3317C3.71686 9.57617 3.18697 10.8563 2.06096 11.4907C0.834324 12.1823 0 13.4981 0 15C0 16.5019 0.834324 17.8176 2.06096 18.5093C3.18697 19.1437 3.71686 20.4238 3.36912 21.6683C2.98953 23.0249 3.33091 24.5445 4.39323 25.6068C5.45555 26.6691 6.97518 27.0105 8.3317 26.6309C9.57617 26.2831 10.8563 26.813 11.4907 27.939C12.1823 29.1657 13.4981 30 15 30C16.5019 30 17.8176 29.1657 18.5093 27.939C19.1437 26.813 20.4238 26.2831 21.6683 26.6309C23.0249 27.0105 24.5445 26.6691 25.6068 25.6068C26.6691 24.5444 27.0105 23.0248 26.6309 21.6683C26.2831 20.4238 26.813 19.1424 27.939 18.5093ZM14.9999 23.142C10.5149 23.142 6.85789 19.4837 6.85789 15C6.85789 10.515 10.5162 6.85795 14.9999 6.85795C19.4849 6.85795 23.142 10.5163 23.142 15C23.142 19.485 19.4849 23.142 14.9999 23.142ZM19.2071 11.8539C19.5828 12.2297 19.5828 12.8385 19.2071 13.2143L14.2737 18.1464C13.898 18.5221 13.2891 18.5221 12.9133 18.1464L10.7912 16.0243C10.4155 15.6485 10.4155 15.0397 10.7912 14.6639C11.167 14.2881 11.7759 14.2881 12.1516 14.6639L13.5948 16.1071L17.848 11.8539C18.2237 11.4782 18.8326 11.4782 19.2071 11.8539Z"/>
          </svg>
          <figure class="text-xs font-bold text-white">
            Open Source
          </figure>
        </section>
        <section class="flex gap-2 items-center">
          <svg class="fill-white/70" width="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.72919 0 0 6.72919 0 15C0 23.2708 6.72919 30 15 30C23.2708 30 30 23.2708 30 15C30 6.72919 23.2708 0 15 0ZM15 27.0014C8.38275 27.0014 2.9986 21.6176 2.9986 15C2.9986 8.38242 8.38275 2.9986 15 2.9986C21.6172 2.9986 27.0014 8.38275 27.0014 15C27.0014 21.6172 21.6172 27.0014 15 27.0014Z"/>
            <path d="M16.4993 5.2959H13.5007V14.5626V15.8223L14.5626 16.4993L22.1474 21.3357L23.7596 18.8073L16.4993 14.1778V5.2959Z"/>
          </svg>
          <figure class="text-xs font-bold text-white">
            System Controlled
          </figure>
        </section>
        <section class="flex gap-2 items-center">
          <svg class="fill-white/70" width="20" viewBox="0 0 30 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.7281 2.62119L21.9424 5.51206L16.5853 10.7868L9.85058 4.14213L0 13.8718L3.14869 16.9784L9.85058 10.3661L16.5853 17L25.2442 8.46764L28.4147 11.3154L30 0L18.7281 2.62119Z"/>
          </svg>
          <figure class="text-xs font-bold text-white">
            Offset Inflation
          </figure>
        </section>
      </section>
    </section>


  </section>

  <section class="relative -mt-50">
    <figure class="absolute top-0 bottom-0 left-0 right-0 bg-black" style="z-index: -1;"></figure>

    <ProposalsList />
  </section>

  <!-- black bottom gap -->
    <section class="h-50 bg-black"></section>
</section>


<style lang="scss">

</style>