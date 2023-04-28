importScripts('/vendors/dexie.min.js');
const channelGuilId = 'd235a86e-bc13-4539-b4a5-077de485a2fd';
const dexieDbName = 'gsl-admin-spa';
const dexieColumns = 'key,value';
const dexieItemKey = 'notify-call-click';

var db = new Dexie(dexieDbName);
db.version(1).stores({ items: dexieColumns });

self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log('received message from web push server');
    console.log(data);

    event.waitUntil(processMessage(data));
});

async function processMessage(data) {
    const windows = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
    });

    if (windows && windows.length > 0) {
        sendToBroadcastChannel(data);
    } else {
        if (data.messageType !== 'cancel') {
            let titleContent = data.title + '';
            if (data.type === 'real_estate') {
                switch (data.messageType) {
                    case 'normal':
                        titleContent += '（通常）';
                        break;

                    case 'auto':
                        titleContent += '（自動コール）';
                        break;
                }
            }

            self.registration.showNotification(titleContent, {
                body: data.body,
                data: data,
                icon: data.icon,
            });
        }
    }
}

function sendToBroadcastChannel(data) {
    new BroadcastChannel(channelGuilId).postMessage(data);
}

self.addEventListener('notificationclick', (event) => {
    const data = event.data || event.notification.data;
    console.log('received message from web push server', data);
    event.notification.close();

    event.waitUntil(processClickMessage(data));
});

async function processClickMessage(data) {
    clients.openWindow('/?next=video-call&type=' + data.type).then((client) => {
        db.items.put({ key: dexieItemKey, value: data });
    });
}
