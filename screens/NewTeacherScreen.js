import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';

import commonStyles from '../common/styles';

const theme = {
    Input: {
        containerStyle: {
            marginBottom: 20
        }
    },
    Button: {
        containerStyle: {
            paddingHorizontal: 50,
            paddingVertical: 20
        }
    }
};

export default class NewTeacherScreen extends React.Component {
    constructor(props) {
        super(props);
        this.input1Ref = React.createRef();
        this.input2Ref = React.createRef();
        this.input3Ref = React.createRef();
    }
    state = {
        loading: false,
        successOverlayVisible: false
    };
    clearForm = () => {
        this.input1Ref.current.clear();
        this.input2Ref.current.clear();
        this.input3Ref.current.clear();
    };
    onPressSubmit = () => {
        this.setState({loading: true});
        window.setTimeout(_ => {
            this.clearForm();
            this.setState({
                loading: false,
                successOverlayVisible: true
            });
        }, 2000);
    };
    backToAdminPress = () => {
        this.addMoreButtonPress();
        this.props.navigation.goBack();
    };
    addMoreButtonPress = () => {
        this.setState({
            successOverlayVisible: false
        });
    };
    render() {
        return (
            <ScrollView style={commonStyles.container}>
                {
                    this.state.successOverlayVisible && (
                        <Overlay
                            isVisible
                            onBackdropPress={() => this.setState({ successOverlayVisible: false })}
                        >
                            <View style={{flex: 1, justifyContent: 'center'}}>
                                <Text h3 style={{marginBottom: 40}}>Teacher added!</Text>
                                <Button
                                    title='Back to admin'
                                    onPress={this.backToAdminPress}
                                    containerStyle={{marginVertical: 20}}
                                />
                                <Button
                                    title='Add more'
                                    type='outline'
                                    onPress={this.addMoreButtonPress}
                                    containerStyle={{marginVertical: 20}}
                                />
                            </View>
                        </Overlay>
                    )
                }
                <View>
                    <Text h3 style={[commonStyles.headingText, {marginBottom: 20}]}>Use this screen to add a new teacher</Text>
                    <ThemeProvider theme={theme}>
                        <Input
                            label='First name'
                            placeholder='Beyoncé'
                            ref={this.input1Ref}
                        />
                        <Input
                            label='Last name'
                            placeholder='Knowles'
                            ref={this.input2Ref}
                        />
                        <Input
                            label='Email address'
                            placeholder='queen@beyonceknowles.com'
                            rightIcon={{ name: 'email', type: 'material' }}
                            ref={this.input3Ref}
                        />
                        <Button
                            title="Submit"
                            onPress={this.onPressSubmit}
                            loading={this.state.loading}
                        />
                    </ThemeProvider>
                </View>
            </ScrollView>
        );
    }
}