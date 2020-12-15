<script>
    import { onDestroy } from 'svelte';
    import io from 'socket.io-client';

    import { credentials, socketConnectionState, modalStatus } from '~/lib/store';
    import { decrypt, parse } from '~/lib/helpers';
    import { SchemaNames } from '~/lib/identity/schemas';
    import Socket from '~/lib/socket';

    const unsubscribe = socketConnectionState.subscribe((state) => {
        if (state.state === 'registerMobileClient') {
            establishConnection(state.payload.url);
            registerMobileClient(state.payload.url, state.payload.channelId);

            socketConnectionState.set({ state: 'connected', payload: null });
        }
    });

    onDestroy(() => {
        unsubscribe();
        socketConnectionState.set({ state: 'disconnected', payload: null });
    });

    function establishConnection(url) {
        const urls = Socket.connections.map((connection) => connection.url);

        if (!urls.includes(url)) {
            Socket.connections.push({
                url,
                socket: io(url, {
                    reconnection: true,
                    reconnectionDelay: 500,
                    jsonp: false,
                    reconnectionAttempts: Infinity,
                    transports: ['websocket']
                })
            });
        }

        // Set state in store
        socketConnectionState.set({ state: 'connected', payload: null });

        initiateListeners();
    }

    function initiateListeners() {
        Socket.connections.forEach((connection) => {
            connection.socket.on('createCredential', (message) => {
                const { url, schemaName, data } = message;

                let password = $credentials.immunity.password;

                if (schemaName === SchemaNames.VISA_APPLICATION) {
                    password = $credentials.visa.password;
                } else if (schemaName === SchemaNames.COMPANY) {
                    password = $credentials.company.password;
                } else if (schemaName === SchemaNames.BANK_ACCOUNT) {
                    password = $credentials.bank.password;
                } else if (schemaName === SchemaNames.INSURANCE) {
                    password = $credentials.insurance.password;
                } else if (schemaName === SchemaNames.FUTURE_COMMITMENTS) {
                    password = $credentials.futureCommitment.password;
                } else if (schemaName === SchemaNames.PRESENT_COMMITMENTS) {
                    password = $credentials.presentCommitment.password;
                }

                const payload = {};

                payload.data = parse(decrypt(password, data));
                payload.url = url;

                modalStatus.set({ active: true, type: 'accept', props: { schemaName, payload } });
            });
        });
    }

    function registerMobileClient(url, channelId) {
        Socket.getActiveSocket(url).emit('registerMobileClient', { channelId });
    }
</script>
