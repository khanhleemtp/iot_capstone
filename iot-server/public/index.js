
// connect socket 
const socket = io('http://localhost:9000');

socket.on('connection', () => {
    console.log('Connected');
    // open new tab, id is different
});

socket.on('dataFromServer', (dataFromServer) => {
    console.log(dataFromServer);
    // socket.emit('dataToServer', { data: 'Iam come from FE' });
});
// socket.on('messageFromServer1', (dataFromServer) => {
//     console.log(dataFromServer);
//     // socket.emit('dataToServer', { data: 'Iam come from FE' });
// });
