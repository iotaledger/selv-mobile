<script>
    import { onDestroy, onMount } from 'svelte';
    import io from 'socket.io-client';

    import { WEBSOCKETS_URL } from '~/lib/config';
    import { credentials, socketConnectionState, modalStatus } from '~/lib/store';
    import { decrypt, parse } from '~/lib/helpers';
    import { SchemaNames } from '~/lib/identity/schemas';
    import Socket from '~/lib/socket';

    const unsubscribe = socketConnectionState.subscribe((state) => {
        if (state.state === 'registerMobileClient') {
            registerMobileClient(state.payload.channelId);

            socketConnectionState.set({ state: 'connected', payload: null });
        }
    });

    onMount(() => {
        // Establish a web socket connection with the server on load
        establishConnection();
    });

    onDestroy(() => {
        unsubscribe();
        socketConnectionState.set({ state: 'disconnected', payload: null });
    });

    function establishConnection() {
        Socket.socket = io(WEBSOCKETS_URL, {
            reconnection: true,
            reconnectionDelay: 500,
            jsonp: false,
            reconnectionAttempts: Infinity,
            transports: ['websocket']
        });

        // Set state in store
        socketConnectionState.set({ state: 'connected', payload: null });

        initiateListeners();
    }

    function initiateListeners() {
        Socket.socket.on('createCredential', (message) => {
            const { schemaName, data } = message;

            let password = $credentials.immunity.password;

            if (schemaName === SchemaNames.VISA_APPLICATION) {
                password = $credentials.visa.password;
            }

            let payload = parse(decrypt(password, data));

            modalStatus.set({ active: true, type: 'accept', props: { schemaName, payload } });
        });
    }

    function registerMobileClient(channelId) {
        Socket.socket.emit('registerMobileClient', { channelId });
    }
</script>
