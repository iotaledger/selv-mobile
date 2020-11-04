type Connection = {
    url: string;
    socket: any;
};

/**
 * Web socket (global) object
 */
export default {
    getActiveSocket(url: string): any {
        const { connections } = this;
        const socket = connections.find((connection: Connection) => connection.url === url);

        return socket.socket;
    },
    connections: [],
};
