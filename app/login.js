import React from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, StyleSheet, KeyboardAvoidingView } from 'react-native';
import realm from './realm';
import { loginWithPassword, loadSubscriptions, Accounts } from './meteor';


const styles = StyleSheet.create({
	view: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'stretch'
	},
	input: {
		height: 40,
		borderColor: '#aaa',
		marginLeft: 20,
		marginRight: 20,
		marginTop: 10,
		padding: 5,
		borderWidth: 0,
		backgroundColor: '#f6f6f6'
	}
});

export default class LoginView extends React.Component {
	static propTypes = {
		navigation: PropTypes.object.isRequired
	}

	static navigationOptions = () => ({
		title: realm.objectForPrimaryKey('settings', 'Site_Name').value
	});

	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: ''
		};

		const { navigate } = this.props.navigation;

		Accounts.onLogin(() => {
			loadSubscriptions(() => {
				navigate('Rooms');
			});
		});

		this.submit = () => {
			loginWithPassword({ username: this.state.username }, this.state.password);
		};
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.view} behavior='padding'>
				<TextInput
					style={styles.input}
					onChangeText={username => this.setState({ username })}
					keyboardType='email-address'
					autoCorrect={false}
					returnKeyType='done'
					autoCapitalize='none'
					autoFocus
					onSubmitEditing={this.submit}
					placeholder='Email or username'
				/>
				<TextInput
					style={styles.input}
					onChangeText={password => this.setState({ password })}
					secureTextEntry
					autoCorrect={false}
					returnKeyType='done'
					autoCapitalize='none'
					onSubmitEditing={this.submit}
					placeholder='Password'
				/>
			</KeyboardAvoidingView>
		);
	}
}
