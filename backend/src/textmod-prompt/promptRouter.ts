import { createProxyMiddleware, Filter, fixRequestBody, Options, responseInterceptor } from 'http-proxy-middleware';
import { Router, Request, Response, RequestHandler } from 'express';
import { IncomingMessage } from 'http';
import { apiKeyValidationMiddleware } from '../textmod-apikeys';

const pathFilter: Filter<IncomingMessage> = (pathname, req) => {
    return Boolean(pathname.match(/^\/check/) && req.method === 'POST');
};

const pathRewrite = {
    '^/check': '/v1/chat/completions'
}

interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    choices: [
      {
        message: {
          role: string;
          content: string;
        };
        finish_reason: null;
        index: number;
      }
    ];
  }
  interface SpamInfo {
    spam: boolean;
    'self-promoting': boolean;
    hate: boolean;
    terrorism: boolean;
    extremism: boolean;
    pornographic: boolean;
    threatening: boolean;
    'self-harm': boolean;
    sexual: boolean;
    'sexual/minors': boolean;
    violence: boolean;
    'violence/graphic': boolean;
  }

  
  const spamInfo: SpamInfo = {
    spam: false,
    'self-promoting': false,
    hate: false,
    terrorism: false,
    extremism: false,
    pornographic: false,
    threatening: false,
    'self-harm': false,
    sexual: false,
    'sexual/minors': false,
    violence: false,
    'violence/graphic': false,
  };



  function isSpamInfoKey(key: string): key is keyof SpamInfo {
    return Object.prototype.hasOwnProperty.call(spamInfo, key);
  }
  

const options : Options = {
    target: process.env.OPEN_AI_BASE_URL,
    changeOrigin: true,
    pathFilter: pathFilter,
    pathRewrite: pathRewrite,
    selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()
    on: {
        proxyReq: fixRequestBody,
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes: IncomingMessage, req, res) => {
          // handle successful response
          if (proxyRes && proxyRes.statusCode && proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
            // detect json responses
            if (proxyRes.headers['content-type'] === 'application/json') {
              const chatCompletion = JSON.parse(responseBuffer.toString('utf8')) as ChatCompletion;      
              const text = chatCompletion.choices[0].message.content
              text.trim().split('\n').forEach((line) => {
                const [key, value] = line.split(':');
                const trimmedKey = key.trim() as keyof SpamInfo;
                if (isSpamInfoKey(trimmedKey)) {
                  spamInfo[trimmedKey] = value.trim() === 'true';
                }
              });
      
              // return manipulated JSON
              return JSON.stringify(spamInfo);
            }
          
            // return other content-types as a Bad Request
            else {
              res.statusCode = 400;
              res.end();
              return responseBuffer;
            }
          }
          
          // handle other response codes
          else {
            let message: string;
            if (proxyRes && proxyRes.statusCode) {
              if (proxyRes.statusCode >= 400 && proxyRes.statusCode < 500) {
                message = 'Client error';
              } else if (proxyRes.statusCode >= 500 && proxyRes.statusCode < 600) {
                message = 'Server error';
              } else {
                message = 'Redirection error';
              }
              res.statusCode = proxyRes.statusCode;
            } else {
              // If proxyRes is not defined or statusCode is undefined, default to a 500 error
              message = 'Unknown error';
              proxyRes = { statusCode: 500 } as IncomingMessage;
              res.statusCode = 500;
            }
      
            res.end({ message });
            return responseBuffer;
          }
        }),
      }
};

const openAiBody = (content: string) => ({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: `Check if '${content}' expresses these sentiments spam, self-promoting, hate, terrorism, extremism, pornographic, threatening, self-harm, sexual, sexual/minors, violence, violence/graphic, respond in a list with the following format sentiment name: true/false`}],
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  })

  const openAiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPEN_AI_API_KEY}`,
  }

const preFlightRequestHandler : RequestHandler = (req, res, next) => {
    const body = openAiBody(req.body.content)
    req.headers = openAiHeaders
    req.body = body
    return next()
}


const promptRouter = Router();

const middlewareProxy = createProxyMiddleware(options)

promptRouter.post('/check', apiKeyValidationMiddleware, preFlightRequestHandler, middlewareProxy);


export default promptRouter;
