﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatWidget.Core
{
    public interface IEngine
    {
        void OnMessage(MessageContext context);
    }
}
