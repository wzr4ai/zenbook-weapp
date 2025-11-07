const TOKEN_REGEX = /YYYY|MM|DD|HH|mm|ss/g;

function pad(value) {
  return String(value).padStart(2, '0');
}

class DayjsLite {
  constructor(value) {
    this.date = value ? new Date(value) : new Date();
  }

  format(template) {
    if (!template) {
      return '';
    }
    if (Number.isNaN(this.date.getTime())) {
      return '';
    }
    const replacements = {
      YYYY: `${this.date.getFullYear()}`,
      MM: pad(this.date.getMonth() + 1),
      DD: pad(this.date.getDate()),
      HH: pad(this.date.getHours()),
      mm: pad(this.date.getMinutes()),
      ss: pad(this.date.getSeconds()),
    };

    return template.replace(TOKEN_REGEX, (token) => replacements[token] ?? token);
  }
}

export default function dayjs(value) {
  return new DayjsLite(value);
}
