const isEmpty = value => value === undefined || value === null || value === "";
const join = rules => (value, data) =>
rules.map(rule => rule(value, data)).filter(error => !!error)[0/* first error */];

export function email(value: string) {
  // Let's not start a debate on email regex. This is just for an example app!
  if (!isEmpty(value) && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return "Invalid email address";
  }
  return null;
}

export function required(value: string) {
  if (isEmpty(value)) {
    return "Required";
  }
}

export function minLength(min: number) {
  return (value: string) => {
    if (!isEmpty(value) && value.length < min) {
      return `Must be at least ${min} characters`;
    }
  };
}

export function maxLength(max: number) {
  return (value) => {
    if (!isEmpty(value) && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
  };
}

export function integer(value: string) {
  if (!Number.isInteger(Number(value))) {
    return "Must be an integer";
  }
}

export function oneOf(enumeration: [any]): (x: string) => string|void {
  return (value: string) => {
    if (enumeration.indexOf(value) < 0) {
      return `Must be one of: ${enumeration.join(", ")}`;
    }
  };
}

export function match(field: string): (x: string, data: any) => string|void {
  return (value: string, data: any) => {
    if (data) {
      if (value !== data[field]) {
        return "Do not match";
      }
    }
  };
}
export function createValidator(rules: any): (data: any) => any|void {
  return (data = {}) => {
    const errors = {};
    Object.keys(rules).forEach((key) => {
      // concat enables both functions and arrays of functions
      const rule = join([].concat(rules[key]));
      const error = rule(data[key], data);
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };
}
