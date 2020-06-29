type XPath = string;
type Predicate = string;
type Strings = string | Strings[] | undefined;

const xpathRegex = /\/\/[a-z*]+(\[.*\])*/;

function isXPath(text: string): boolean {
  return xpathRegex.test(text);
}


/**
 * Formats an argument into one or more XPath predicates.
 * If the argument is a valid XPath, then the predicate will match all elements that contain the
 * element identified by that XPath.
 * If the argument is any other string, then the predicate will match all elements that contain
 * that string in their text bodies.
 * If the argument is an array, the function is called recursively and multiple predicates are
 * returned in the same string.
 *
 * @param content the content of the element to form a predicate for
 */
function contentAsPredicate(content?: Strings): Predicate {
  if (Array.isArray(content)) {
    return content.map((c) => contentAsPredicate(c)).join('');
  }
  if (typeof content === 'string') {
    if (isXPath(content)) {
      return `[.${content}]`;
    }
    return `[contains(text(),"${content}")]`;
  }
  return '';
}

/**
 * Formats a list of CSS classes into XPath predicates.
 *
 * @param classes the CSS classes to form a predicate for
 */
function classAsPredicate(...classes: Strings[]): Predicate {
  return classes.map((cssClass) => {
    if (Array.isArray(cssClass)) {
      return cssClass.map((c) => classAsPredicate(c)).join('');
    }
    if (typeof cssClass === 'string') {
      return `[contains(concat(" ",@class," "), " ${cssClass} ")]`;
    }
    return '';
  }).join('');
}

/**
 * Formats an element of a component as a XPath predicate.
 * Vuetify components will generally have this structure for sub-elements,
 * so this helper saves a lot of boilerplate.
 * For example:
 * <v-foo>
 *   <div class="v-foo__title" ... />
 *   <div class="v-foo__contents" ... />
 * </v-foo>
 *
 * @param name the name of the Vuetify component
 * @param element the name of the element
 * @param value the contents of the element
 */
function elementAsPredicate(name: string, element: string, value: Strings): Predicate {
  return (value) ? `[.//*[@class="${name}__${element}"]${contentAsPredicate(value)}]` : '';
}

/**
 * Formats a list of elements of a component as a XPath predicate.
 * This is a wrapper for elementAsPredicate that handles multiple elements.
 *
 * @param name the name of the Vuetify component
 * @param values the contents of each element
 */
function elementsAsPredicate<T extends { [key: string]: Strings }>(name: string, values: T): Predicate {
  return Object.keys(values).map((key) => elementAsPredicate(name, key, values[key])).join('');
}

/**
 * Parses the argument to a wrapped vElement function.
 * If the argument is an object, it is passed directly to the wrapped function as destructured arguments.
 * Otherwise, the argument is wrapped in an object, keyed by a default parameter.
 *
 * For this example function definition:
 *
 * function _vFoo({content, cssClass}) { ... }
 * export const vFoo = defaultParam(_vFoo, 'content')
 *
 * This wrapper allows calls like this to be mapped like so:
 *
 * vFoo() => vFoo({})
 * vFoo('abc') => vFoo({content: 'abc'})
 * vFoo(['abc', 'xyz']) => vFoo({content: ['abc, 'xyz']})
 * vFoo({cssClass: 'test'}) => vFoo({cssClass: 'test'}) // no change
 *
 * @param vFunction the XPath generator function to wrap
 * @param defaultParam the name of the default parameter to use
 */
function defaultParam<T>(vFunction: (args: T) => XPath, defaultParam: keyof T) {
  return function (args?: T | Strings) {
    if (typeof args === 'object' && !Array.isArray(args)) {
      return vFunction(args);
    }
    const ret: any = {};
    ret[defaultParam] = args;
    return vFunction(ret);
  }
}


function _vAvatar({ content, cssClass }: { content?: Strings, cssClass?: Strings }): XPath {
  return `//div${classAsPredicate('v-avatar', cssClass)}[span${contentAsPredicate(content)}]`;
}
export const vAvatar = defaultParam(_vAvatar, 'content');


function _vBtn({ content, cssClass }: { content?: Strings, cssClass?: Strings }): XPath {
  return `//*${classAsPredicate('v-btn', cssClass)}[span${contentAsPredicate(content)}]`;
}
export const vBtn = defaultParam(_vBtn, 'content');


function _vCard({ content, cssClass, title, actions }: { content?: Strings, cssClass?: Strings, title?: Strings, actions?: Strings }): XPath {
  return `//div${classAsPredicate('v-card', cssClass)}${elementsAsPredicate('v-card', { title, actions })}${contentAsPredicate(content)}`;
}
export const vCard = defaultParam(_vCard, 'content');


function _vChip({ content, cssClass }: { content?: Strings, cssClass?: Strings }): XPath {
  return `//*${classAsPredicate('v-chip', cssClass)}[*[@class="v-chip__content"]${contentAsPredicate(content)}]`;
}
export const vChip = defaultParam(_vChip, 'content');


function _vIcon({ icon, cssClass }: { icon?: Strings, cssClass?: Strings }): XPath {
  return `//*${classAsPredicate('v-icon', icon, cssClass)}`;
}
export const vIcon = defaultParam(_vIcon, 'icon');


function _vListItem({ content, action, title, subtitle }: { content?: Strings, action?: Strings, title?: Strings, subtitle?: Strings }): XPath {
  return `//*${classAsPredicate('v-list-item')}${elementsAsPredicate('v-list-item', {
    content, action, title, subtitle,
  })}`;
}
export const vListItem = defaultParam(_vListItem, 'content');


function _vListItemTitle({ content, cssClass }: { content?: Strings, cssClass?: Strings }): XPath {
  return `//div${classAsPredicate('v-list-item__title', cssClass)}${contentAsPredicate(content)}`;
}
export const vListItemTitle = defaultParam(_vListItemTitle, 'content');


function _vTextarea({ label, cssClass }: { label?: Strings, cssClass?: Strings }): XPath {
  return `//div${classAsPredicate('v-textarea', cssClass)}//div[label[contains(text(),"${label}")]]//textarea`;
}
export const vTextarea = defaultParam(_vTextarea, 'label');


function _vTextField({ label, cssClass }: { label?: Strings, cssClass?: Strings }): XPath {
  const labelPredicate = (label) ? `[.//div[label[contains(text(),"${label}")]]]` : '';
  return `//div${classAsPredicate('v-text-field', cssClass)}${labelPredicate}//input`;
}
export const vTextField = defaultParam(_vTextField, 'label');


function _vToolbar({ content, cssClass }: { content?: Strings, cssClass?: Strings }): XPath {
  return `//*${classAsPredicate('v-toolbar', cssClass)}[*[@class="v-toolbar__content"]${contentAsPredicate(content)}]`;
}
export const vToolbar = defaultParam(_vToolbar, 'content');
