﻿using ChatWidget.API.Shared.Agents;
using ChatWidget.Core.Message;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChatWidget.API.Agents.MyChatBot
{
    public class MyChatBotAgent : IAgent
    {
        ChatBot ChatBot { get; set; }

        public MyChatBotAgent(ChatBot chatBot)
        {
            ChatBot = chatBot;
        }

        public List<AgentMessage> OnMessageFromUser(AgentUserMessage payload)
        {
            var messages = new List<AgentMessage>();
            ChatBot.MessageHandler = (botMessage) => messages.Add(new AgentMessage
            {
                UserId = payload.UserId,
                Type = botMessage.GetType().Name,
                Message = botMessage
            });
            
            ChatBot.Send(ConvertUserMessage(payload));
            return messages;
        }

        private IUserMessage ConvertUserMessage(AgentUserMessage message)
        {
            var type = Type.GetType($"ChatWidget.Core.Message.{message.Type}, ChatWidget");
            var userMessage = (IUserMessage)JsonSerializer.Deserialize(message.Message, type);
            userMessage.UserId = message.UserId;
            userMessage.BotId = message.BotId.Value;
            return userMessage;
        }
    }
}