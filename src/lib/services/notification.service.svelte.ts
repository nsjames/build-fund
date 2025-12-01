class NotificationStore {
    public notifications:Array<{id:string, message:string, type:string}> = $state([]);
}

export const notificationStore = new NotificationStore();

// Handles TOAST notifications
export class NotificationService {
    static addNotification(message:string, type:string = 'info', timeout:number = 5000) {
        const id = Math.random().toString(36).substring(2, 15);
        notificationStore.notifications.push({id, type, message});

        setTimeout(() => {
            notificationStore.notifications = notificationStore.notifications.filter(n => n.id !== id);
        }, timeout);
    }

    static removeNotification(id:string):void {
        notificationStore.notifications = notificationStore.notifications.filter(n => n.id !== id);
    }

    static connectWallet() {
        NotificationService.addNotification("Connect your wallet first.", "error");
    }
}