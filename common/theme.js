import Colors from './colors';

const theme = {
    Input: {
        containerStyle: {
            marginBottom: 20,
        },
        inputStyle: {
            fontFamily: 'montserrat',
        },
        labelStyle: {
            color: Colors.black,
            fontFamily: 'montserrat',
            textTransform: 'uppercase',
            fontWeight: 'normal',
        }
    },
    Button: {
        containerStyle: {
            paddingHorizontal: 50,
            paddingVertical: 20,
        },
        buttonStyle: {
            backgroundColor: Colors.pop,
        },
        titleStyle: {
            fontFamily: 'archivo-black',
            textTransform: 'uppercase',
            color: Colors.white,
        }
    },
    Text: {
        style: {
            fontFamily: 'montserrat',
        },
        h3Style: {
            fontFamily: 'archivo-black',
            textTransform: 'uppercase',
            fontWeight: 'normal', // we don't have bold, which is the default here
        }
    }
};

export default theme;