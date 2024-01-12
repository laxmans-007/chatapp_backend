import winston from "winston";
import winstonRotator from 'winston-daily-rotate-file';

const {
    combine,
    timestamp,
    label,
    printf
} = winston.format;

const logFormat = printf(({
    level,
    message,
    label,
    timestamp
  }) => {
    return `${timestamp} - ${level}: ${message}`;
  });
  
 
  
  export default (prefix) => {

//   const successRotator = new winstonRotator({
//     name: 'access-logs',
//     filename: global.ROOT_DIR + '/logs/access-%DATE%.log',
//     datePattern: 'yyyy-MM-DD',
//     json: false,
//     level: 'info'
//     });

    const errorRotator = new winstonRotator({
        name: 'error-logs',
        filename: global.ROOT_DIR + '/logs/error-%DATE%.log',
        datePattern: 'yyyy-MM-DD',
        json: false,
        level: 'error',
        maxFiles: '30d',
    });
    
    // const infoLogger = winston.createLogger({
    //     level: 'debug',
    //     format: combine(
    //       timestamp(),
    //       logFormat
    //     ),
    //     transports: [
    //         successRotator
    //     ]
    // });
    
    const errorLogger = winston.createLogger({
        level: 'error',
        format: combine(
          timestamp(),
          logFormat
        ),
        transports: [
            errorRotator
        ]
    });
    
    // const memoryRotator = new winstonRotator({
    //     filename: global.ROOT_DIR + '/logs/memory-%DATE%.log',
    //     datePattern: 'yyyy-MM-DD',
    //     json: true
    // });
    
    // const memoryLogger = winston.createLogger({
    //     format: combine(
    //           timestamp(),
    //           logFormat
    //         ),
    //     transports: [
    //         memoryRotator
    //     ]
    // });

      return [
        "info",
        "verbose",
        "warn",
        "debug",
        "error",
        "mInfo"
      ].reduce((logger, type) => {
        if(type == "error") {
          logger[type] = (...args) => errorLogger[type](`${prefix || "EMAIL_REPLY_PROCESS :: "} ${args.join(" ")}`);
        } 
        // else if(type == "mInfo") {
        //   logger[type] = (...args) => memoryLogger['info'](`${prefix || "EMAIL_REPLY_PROCESS :: "} ${args.join(" ")}`);
        // } else {
        //   logger[type] = (...args) => infoLogger[type](`${prefix || "EMAIL_REPLY_PROCESS :: "}${args.join(" ")}`);
        // }
        return logger;
      }, {});
      
    };