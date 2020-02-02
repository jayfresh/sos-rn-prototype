import Colors from './colors';

const theme = {
    Input: {
        containerStyle: {
            marginBottom: 20,
        },
        labelStyle: {
            color: Colors.black,
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
        }
    },
    Text: {
        style: {
            fontFamily: 'montserrat',
            // color: 'blue',
        }
    }
};

export default theme;