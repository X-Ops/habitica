// A map of messages used by the API that don't need to be translated and
// so are not placed into /common/locales

import clone from 'lodash/clone';
import template from 'lodash/template';
import isFunction from 'lodash/isFunction';

// When this file grows, it can be split into multiple ones.
const messages = {
  'groups.paginate.only': 'Only public guilds support pagination.',
  guildsPaginateBooleanString: 'req.query.paginate must be a boolean string.',
  guildsPageInteger: 'req.query.page must be an integer greater than or equal to 0.',
};

export function t (msgKey, vars = {}) {
  let clonedVars = vars ? clone(vars) : {};

  let message = messages[msgKey];
  if (!message) throw new Error(`Error processing the API message "${msgKey}".`);

  if (isFunction(message)) { // message is already compiled and cached
    return message(clonedVars);
  } else {
    let compiled = template(message);
    messages[msgKey] = compiled; // cache the result of _.template
    return compiled(clonedVars);
  }
}