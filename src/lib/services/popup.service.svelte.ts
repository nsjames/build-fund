import {globalStore} from "$lib/store/global.store.svelte";

export enum PopupType {
    Burn,
    Cancel,
    Proposing,
}

// A popup represents a modal dialog that can be opened and closed.
export class Popup {
    public id:number = -1;
    public type:PopupType = PopupType.Burn;
    public data:any = {};

    constructor(json:Partial<Popup> = {}) {
        Object.assign(this, json);
    }

    public async close(skipSubmit:boolean = false): Promise<void> {
        PopupService.close(this.id, skipSubmit);
    }
}

let popups:any = $state([]);

export class PopupService {
    public static getPopups() {
        return popups;
    }
    
    public static open(type:PopupType, data:any = {}): Popup {
        const id = Math.round(Math.random() * 10000000000000);
        const popup = new Popup({
            id,
            type,
            data: {
                ...data,
                submit: async (result:any) => {
                    if(data.submit) {
                        await data.submit(result);
                    }
                    popups = popups.filter(p => p.id !== id);
                },
            },
        });

        popups = [...popups, popup];

        return popup;
    }

    public static close(id:number, skipSubmit:boolean = false) {
        const popup = popups.find(p => p.id === id);
        if (popup) {
            if (popup.data.submit && !skipSubmit) {
                popup.data.submit(null);
            }
            popups = popups.filter(p => p.id !== id);
        }
    }

    public static burn(handler:(amount:number, token:'EOS'|'A') => void,): Popup {
        const popup = this.open(PopupType.Burn, {
            submit: async (result: {amount:number, token:'EOS'|'A'}) => {
                await popup.close(true);
                handler(result.amount, result.token);
            },
        });

        return popup;
    }

    public static cancel(handler:(cancel:boolean) => void,): Popup {
        const popup = this.open(PopupType.Cancel, {
            submit: async (result:boolean) => {
                await popup.close(true);
                handler(result);
            },
        });

        return popup;
    }

    public static proposing() : Popup {
        globalStore.proposingStep = 0;
        return this.open(PopupType.Proposing, {
            cantClose: true,
        });
    }
}