import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Text } from 'react-native';
import { connect } from 'react-redux';
import ActionSheet from 'react-native-actionsheet';

import LoggedView from '../View';
import {
	openStarredMessages,
	closeStarredMessages
} from '../../actions/starredMessages';
import styles from './styles';
import Message from '../../containers/message';
import { toggleStarRequest } from '../../actions/messages';
import RCActivityIndicator from '../../containers/ActivityIndicator';

const STAR_INDEX = 0;
const CANCEL_INDEX = 1;
const options = ['Unstar', 'Cancel'];

@connect(
	state => ({
		messages: state.starredMessages.messages,
		ready: state.starredMessages.ready,
		user: state.login.user,
		baseUrl: state.settings.Site_Url || state.server ? state.server.server : ''
	}),
	dispatch => ({
		openStarredMessages: (rid, limit) =>
			dispatch(openStarredMessages(rid, limit)),
		closeStarredMessages: () => dispatch(closeStarredMessages()),
		toggleStarRequest: message => dispatch(toggleStarRequest(message))
	})
)
export default class StarredMessagesView extends LoggedView {
	static propTypes = {
		navigation: PropTypes.object,
		messages: PropTypes.array,
		ready: PropTypes.bool,
		user: PropTypes.object,
		baseUrl: PropTypes.string,
		openStarredMessages: PropTypes.func,
		closeStarredMessages: PropTypes.func,
		toggleStarRequest: PropTypes.func
	};

	constructor(props) {
		super('StarredMessagesView', props);
		this.state = {
			message: {},
			loading: true,
			loadingMore: false
		};
	}

	componentDidMount() {
		this.limit = 20;
		this.load();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.ready && nextProps.ready !== this.props.ready) {
			this.setState({ loading: false, loadingMore: false });
		}
	}

	componentWillUnmount() {
		this.props.closeStarredMessages();
	}

	onLongPress = (message) => {
		this.setState({ message });
		this.actionSheet.show();
	};

	handleActionPress = (actionIndex) => {
		switch (actionIndex) {
			case STAR_INDEX:
				this.props.toggleStarRequest(this.state.message);
				break;
			default:
				break;
		}
	};

	load = () => {
		this.props.openStarredMessages(
			this.props.navigation.state.params.rid,
			this.limit
		);
	};

	moreData = () => {
		const { loadingMore } = this.state;
		const { messages } = this.props;
		if (messages.length < this.limit) {
			return;
		}
		if (!loadingMore) {
			this.setState({ loadingMore: true });
			this.limit += 20;
			this.load();
		}
	};

	renderEmpty = () => (
		<View style={styles.listEmptyContainer}>
			<Text>No starred messages</Text>
		</View>
	);

	renderItem = ({ item }) => (
		<Message
			item={item}
			style={styles.message}
			reactions={item.reactions}
			user={this.props.user}
			baseUrl={this.props.baseUrl}
			customTimeFormat='MMMM Do YYYY, h:mm:ss a'
			onLongPress={this.onLongPress}
		/>
	);

	render() {
		const { loading, loadingMore } = this.state;
		const { messages, ready } = this.props;

		if (ready && messages.length === 0) {
			return this.renderEmpty();
		}

		return [
			<FlatList
				key='starred-messages-view-list'
				data={messages}
				renderItem={this.renderItem}
				style={styles.list}
				keyExtractor={item => item._id}
				onEndReached={this.moreData}
				ListHeaderComponent={loading && <RCActivityIndicator />}
				ListFooterComponent={loadingMore && <RCActivityIndicator />}
			/>,
			<ActionSheet
				key='starred-messages-view-action-sheet'
				ref={o => (this.actionSheet = o)}
				title='Actions'
				options={options}
				cancelButtonIndex={CANCEL_INDEX}
				onPress={this.handleActionPress}
			/>
		];
	}
}
