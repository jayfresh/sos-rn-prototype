const moment = require('moment-timezone');

const formatDate = d => {
    let out = moment(d);
    if (!out.isValid() && d.seconds) {
        out = moment.unix(d.seconds);
    }
    return out.format('HH:mm Do MMM');
};

export { formatDate };