const moment = require('moment-timezone');

const formatDate = (d, durationInMinutes) => {
    let out = moment(d);
    if (!out.isValid() && d.seconds) {
        out = moment.unix(d.seconds);
    }
    const end = moment(out).add(durationInMinutes, 'minutes');
    return out.format('ddd Do MMM // HH:mm-') + end.format('HH:mm');
};

const classTitle = c => {
    return c.name;
};

const classSubtitle = c => {
    return formatDate(c.startTime, c.duration) + ' // ' + c.location;
};

export { formatDate, classTitle, classSubtitle };