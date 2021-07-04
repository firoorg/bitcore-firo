import _ from 'lodash';
import * as winston from 'winston';
import parseArgv from './utils/parseArgv';
let args = parseArgv([], ['DEBUG']);
const logLevel = args.DEBUG ? 'debug' : 'info';
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: logLevel
    })
  ]
});

const timezone = new Date()
  .toLocaleString('en-US', { timeZoneName: 'short' })
  .split(' ')
  .pop();

export const formatTimestamp = (date: Date) =>
  `${
      date.getFullYear()
    }-${
      _.padStart((date.getMonth() + 1).toString(), 2, '0')
    }-${
      _.padStart(date .getDate() .toString(), 2, '0')
    } ${
      _.padStart(date.getHours().toString(), 2, '0')
    }:${
      _.padStart(date.getMinutes().toString(), 2, '0')
    }:${
      _.padStart(date.getSeconds().toString(), 2, '0')
    }.${
      _.padEnd(date.getMilliseconds().toString(), 3, '0')
    } ${timezone}`;

export const timestamp = () => formatTimestamp(new Date());

export default logger;
