import createError from 'http-errors'
import Joi, { Schema, ValidationResult } from 'joi'

interface Handler {
	event: any
	headers?: any
}

interface Middleware {
	before: (handler: Handler, next: () => void) => void
}

export const middleware = ({
	schema,
	options,
}: {
	schema: Schema
	options?: any
}): Middleware => {
	if (!Joi.isSchema(schema)) {
		console.log(
			'[middy-sparks-joi] The schema you provided is not a valid Joi schema',
		)
		throw new Error('The schema is not valid')
	}

	return {
		before: (handler: Handler, next: () => void) => {
			const event = handler.event
			const validation: ValidationResult = schema.validate(event, options)

			if (validation.error) {
				const error = new createError.BadRequest(
					'Event object failed validation',
				)
				handler.event.headers = { ...handler.event.headers }
				error.details = validation.error.details
				throw error
			}
			return next()
		},
	}
}
