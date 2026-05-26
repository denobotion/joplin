/**
 * Logger utility for Joplin application.
 * Provides structured logging with multiple log levels and output targets.
 */

export enum LogLevel {
	None = 0,
	Error = 10,
	Warn = 20,
	Info = 30,
	Debug = 40,
}

export interface LoggerWrapper {
	debug: (...args: any[]) => void;
	info: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;
}

type TargetType = 'console' | 'file' | 'database';

interface LogTarget {
	type: TargetType;
	level?: LogLevel;
	prefix?: string;
	filePath?: string;
}

const levelToString = (level: LogLevel): string => {
	switch (level) {
		case LogLevel.Error: return 'error';
		case LogLevel.Warn: return 'warn';
		case LogLevel.Info: return 'info';
		case LogLevel.Debug: return 'debug';
		default: return 'none';
	}
};

export class Logger {
	private static instance_: Logger = null;
	private targets_: LogTarget[] = [];
	private level_: LogLevel = LogLevel.Info;

	public static get globalLogger(): Logger {
		if (!Logger.instance_) {
			Logger.instance_ = new Logger();
		}
		return Logger.instance_;
	}

	public static create(prefix: string): LoggerWrapper {
		const logger = Logger.globalLogger;
		return {
			debug: (...args: any[]) => logger.debug(prefix, ...args),
			info: (...args: any[]) => logger.info(prefix, ...args),
			warn: (...args: any[]) => logger.warn(prefix, ...args),
			error: (...args: any[]) => logger.error(prefix, ...args),
		};
	}

	public setLevel(level: LogLevel) {
		this.level_ = level;
	}

	public level(): LogLevel {
		return this.level_;
	}

	public addTarget(type: TargetType, options: Omit<LogTarget, 'type'> = {}) {
		this.targets_.push({ type, ...options });
	}

	public clearTargets() {
		this.targets_ = [];
	}

	private formatMessage(level: LogLevel, prefix: string, ...args: any[]): string {
		const timestamp = new Date().toISOString();
		const levelStr = levelToString(level).toUpperCase().padEnd(5);
		const messageStr = args.map(a =>
			typeof a === 'object' ? JSON.stringify(a) : String(a)
		).join(' ');
		return `${timestamp} [${levelStr}] ${prefix ? `${prefix}: ` : ''}${messageStr}`;
	}

	private log(level: LogLevel, prefix: string, ...args: any[]) {
		if (level > this.level_) return;

		const formattedMessage = this.formatMessage(level, prefix, ...args);

		for (const target of this.targets_) {
			const targetLevel = target.level !== undefined ? target.level : this.level_;
			if (level > targetLevel) continue;

			if (target.type === 'console') {
				const consoleMethod = level <= LogLevel.Error ? 'error' :
					level <= LogLevel.Warn ? 'warn' : 'log';
				console[consoleMethod](formattedMessage);
			}
		}
	}

	public error(prefix: string, ...args: any[]) {
		this.log(LogLevel.Error, prefix, ...args);
	}

	public warn(prefix: string, ...args: any[]) {
		this.log(LogLevel.Warn, prefix, ...args);
	}

	public info(prefix: string, ...args: any[]) {
		this.log(LogLevel.Info, prefix, ...args);
	}

	public debug(prefix: string, ...args: any[]) {
		this.log(LogLevel.Debug, prefix, ...args);
	}
}

export default Logger;
