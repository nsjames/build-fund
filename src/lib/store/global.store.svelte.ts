
export const STATUS = {
    Pending: 'pending',
    Working: 'working',
    Success: 'success',
    Failed: 'failed',
}

interface ProposingStep {
    text: string;
    status: string;
}

export const INITIAL_STEPS:ProposingStep[] = [
    {
        text: `Proposing value transfer MSIG`,
        status: STATUS.Working,
    },
    {
        text: `Submitting BuildFund proposal`,
        status: STATUS.Pending,
    },
    {
        text: `Proposal is live!`,
        status: STATUS.Pending,
    }
];

export const CANCEL_MSIG_STEPS:ProposingStep[] = [
    {
        text: `Proposing value transfer MSIG`,
        status: STATUS.Success,
    },
    {
        text: `Submitting BuildFund proposal`,
        status: STATUS.Failed,
    },
    {
        text: `Proposing cancel MSIG`,
        status: STATUS.Working,
    },
    {
        text: `Cancelled proposal`,
        status: STATUS.Pending,
    }
];

class ProposingSteps {
    public steps:ProposingStep[] = $state(INITIAL_STEPS);
    public resetProposingSteps() {
        this.steps = INITIAL_STEPS;
    }
    public setCancelMsigSteps() {
        this.steps = CANCEL_MSIG_STEPS;
    }
    public advanceProposingStep() {
        const currentIndex = this.steps.findIndex(step => step.status === STATUS.Working);
        if (currentIndex !== -1) {
            this.steps[currentIndex].status = STATUS.Success;
            if (currentIndex + 1 < this.steps.length) {
                this.steps[currentIndex + 1].status = STATUS.Working;
            }
        }
    }
    public errorProposingStep() {
        const currentIndex = this.steps.findIndex(step => step.status === STATUS.Working);
        if (currentIndex !== -1) {
            this.steps[currentIndex].status = STATUS.Failed;
        }
    }
    public errorAllProposingSteps() {
        this.steps.forEach(step => {
            if (step.status === STATUS.Working || step.status === STATUS.Pending) {
                step.status = STATUS.Failed;
            }
        });
    }

    public finishProposingSteps() {
        this.steps.forEach(step => {
            if (step.status === STATUS.Working || step.status === STATUS.Pending) {
                step.status = STATUS.Success;
            }
        });
    }
}

export class GlobalStore {
    public proposingSteps = new ProposingSteps();
}

export const globalStore = new GlobalStore();

