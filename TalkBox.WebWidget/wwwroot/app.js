﻿(async function init() {
    var utils = {
        createMessageService(app) {
            return messageService.createSignalRService({
                token: app.token,
                onMessage: (m) => app.renderMessages([m])
            })
        }
    }
    var messageService = {
        apiUrl: "https://localhost:44335",
        SignalRConnection: null,
        createAjaxService({ token, onMessage }) {
            return {
                async sendMessage(message) {
                    var response = await fetch(this.apiUrl + "/chat/send", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(message)
                    }).then((response) => {
                        if (response.status === 401) {
                            localStorage.clear()
                            alert(401)
                        } else return response.json()
                    })
                    onMessage(response)
                }
            }
        },
        createSignalRService({ token, onConnected, onMessage, onError, onClose }) {
            this.SignalRConnection?.stop()
            this.SignalRConnection = new signalR.HubConnectionBuilder()
                .withUrl(this.apiUrl + "/chathub", {
                    accessTokenFactory: () => token
                })
                .withAutomaticReconnect([0, 1000, 5000, null])
                .build();
            this.SignalRConnection.on("onmessage", onMessage);
            this.SignalRConnection.onclose(onClose);
            this.SignalRConnection.start().then(response => {
                if (this.SignalRConnection.state === signalR.HubConnectionState.Connected) onConnected()
            }).catch(err => onError?.(err));

            return {
                async sendMessage(message) {
                    messageService.SignalRConnection.invoke("OnMessage", message);
                },
            }
        },
        async authorize(inboxId) {
            var data = await fetch(this.apiUrl + "/auth?inboxId=" + inboxId, {
                method: "POST"
            }).then((response) => response.json())
            return data.token
        }
    }

    var app = PetiteVue.reactive({
        token: null,
        inboxId: null,
        typeMessage: null,
        showWidget: true,
        messages: [],
        welcomeMessage: null,
        messageService: null,
        async send(message) {
            this.messages.push({
                type: "TextMessage",
                text: message,
                time: "şimdi",
                direction: "me"
            })

            await this.messageService.sendMessage({
                type: "TextMessage",
                message: JSON.stringify({ Text: message })
            })
            
            this.typeMessage = "";
            this.scrollToBottom()
        },
        async setToken() {
            this.token = localStorage.getItem("token")
            if (!this.token) {
                this.token = await messageService.authorize(this.inboxId)
                localStorage.setItem("token", this.token)
            }
        },
        scrollToBottom() {
            this.$nextTick(function () {
                var container = document.getElementsByClassName("widget-messages")[0]
                container.scrollTop = container.scrollHeight;
            })
        },
        renderMessages(messages) {
            messages.forEach(i => {
                this.messages.push({
                    type: i.type,
                    text: i.message.text,
                    time: "şimdi",
                    direction: ""
                })
            })
            this.scrollToBottom()
        },
        async init(args) {
            this.inboxId = args.inboxId;
            this.welcomeMessage = args.welcomeMessage
            await this.setToken()

            this.messageService = utils.createMessageService(this)

            window.parent.postMessage({
                IsOpenedChat: true,
                IsMobile: false
            }, "*");
        },
        async refresh() {
            this.messages = []
            localStorage.clear()
            await this.setToken()
            this.messageService = utils.createMessageService(this)
        }
    })

    app.init({
        inboxId: "89710015-b6fb-4221-b940-013308675b2d",
        welcomeMessage: {
            title: "Do you have a question?",
            text: "We are here to help about our product"
        }
    })

    PetiteVue.createApp(app).mount()
})()