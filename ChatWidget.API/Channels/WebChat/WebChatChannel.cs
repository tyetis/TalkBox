﻿using ChatWidget.API.Agents;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatWidget.API.Channels.WebChat
{
    public class WebChatChannel: BaseChannel, IChannel
    {
        public WebChatChannel(IServiceProvider serviceProvider) : base(serviceProvider)
        {
        }

        public HttpResponse OnMessageFromUser(WebChatUserMessage payload)
        {
            //Save message to database
            var agent = base.GetAgent("MyChatBot.MyChatBotAgent"); // from database
            var agentMessage = agent.OnMessageFromUser(new AgentUserMessage
            {
                Type = payload.Type,
                Message = payload.Message
            });

            return new HttpResponse
            {
                Result = true,
                AgentMessage = agentMessage
            };
        }

        public bool OnMessageFromAgent(AgentMessage payload)
        {
            throw new NotImplementedException();
        }
    }
}