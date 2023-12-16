import _ from 'lodash'
import createError from 'http-errors'
import Joi, { Schema, ValidationResult } from 'joi'

interface Handler {
	event: any
	headers?: any
}

export const middleware = ({
	schema,
	options,
}: {
	schema: { [key: string]: Schema }
	options?: any
}) => {
	_.map(_.keys(schema), (key: string) => {
		if (!Joi.isSchema(schema[key])) {
			console.log(
				'[middy-sparks-joi] The schema you provided is not a valid Joi schema',
			)
			throw new Error('The schema is not valid')
		}
	})

	return {
		before: (handler: Handler, next: () => void) => {
			_.map(_.keys(schema), (key: string) => {
				const input = handler.event[key]
				const validation: ValidationResult = schema[key].validate(
					input,
					options,
				)

				if (validation.error) {
					const error = new createError.BadRequest(
						'Event object failed validation',
					)
					handler.event.headers = { ...handler.event.headers }
					error.details = validation.error.details
					throw error
				}
			})
			return next()
		},
	}
}
