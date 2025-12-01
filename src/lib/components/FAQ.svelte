<script>
    const faq = [
        {
            question: "What industries do you specialize in?",
            answer: "We have experience working across a variety of industries and our approach is adaptable to different sectors. However, a significant portion of our work has been with <b>SaaS, dev-tooling, blockchain, infrastructure, and AI companies</b>."
        },
        {
            question: "How do you measure the success of your developer relations strategies?",
            answer: `We focus primarily on value-driving metrics like developer onboarding, acquisition, retention, and overall satisfaction.
            We track community growth, content reach, and event participation but do so through the lens of business impact.
            <br />
            <br />
            Our goal is to ensure that every strategy we implement contributes directly to your company's bottom line and long-term success.
            <br />
            <br />
            <b>Your success means our success.</b>
            <br />
            <br />
            <i class="font-bold text-xs underline">
                We do not focus on vanity metrics like followers or likes unless you specifically ask us to.
            </i>
            `
        },
        {
            question: "Can you help moderate our developer community?",
            answer: "Absolutely! We offer community moderation as an additional service to ensure that your developer community remains a positive and productive space."
        },
        {
            question: "Do you offer customized solutions based on our company's specific needs?",
            answer: "Yes, we tailor our services to align with your company's goals, culture, and target audience. We work closely with you to develop strategies that resonate with your unique developer community. You will always have the final say on any strategy we propose and messaging we create."
        },
        {
            question: "What is your typical onboarding process for new clients?",
            answer: "Before your introduction call, we conduct a preliminary assessment of your company and its developer relations presence. During the call we will discuss your goals, challenges, and expectations. After the call, we provide a detailed proposal outlining our recommended strategies and next steps if we decide to move forward together."
        },
        {
            question: "How does billings and contracts work?",
            answer: `We operate on a monthly basis with contracts that you can cancel at any time with a 30-day notice. We bill at the beginning of each month for that month's services.
            You may also choose to prepay for multiple months at a time if that works better for your budgeting process.
            <br />
            <br />
            On top of that we offer flexible scaling options.
            If you find that you need to scale up or down your services based on your current needs, we can adjust the scope
            of our work accordingly and reflect those changes in the next month's billing cycle.
`
        }
    ];
</script>

<section class="flex mt-50 max-lg:mt-20 px-30 relative max-lg:px-6 max-lg:flex-col">
    <section class="flex-2 min-lg:pr-20 min-lg:sticky top-10 self-start h-fit max-lg:mb-20">
        <section class="max-w-lg">
            <figure class="serif text-6xl max-lg:text-3xl">
                Frequently Asked Questions
            </figure>
            <figure class="text-lg text-black/70 mt-10 max-lg:text-sm">
                We’ve iterated and learned from past successes and failures enough to be able to easily spot deficiencies and strengths in the processes and companies we work with.
                <br />
                <br />
                You’ll have our decades of experience at your disposal to help turn your developer relations function into a well-oiled machine that produces results.
            </figure>
        </section>
    </section>

    <section class="flex-2">
        <section class="flex flex-col gap-10 max-w-3xl">
            {#each faq as item}
                <section>
                    <figure class="font-bold text-2xl max-lg:text-lg">
                        {item.question}
                    </figure>
                    <figure class="text-md text-black/70 mt-2 max-lg:text-sm">
                        {@html item.answer}
                    </figure>
                </section>
            {/each}
        </section>
    </section>
</section>