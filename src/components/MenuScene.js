import React, { Fragment, PureComponent } from 'react';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  withStyles,
  withTheme
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
  ExitToApp,
  Menu,
  Restore,
  Update
} from '@material-ui/icons';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { loadWeb3Modal, unloadWeb3Modal } from '../controllers/app/actions';
import { withTransition } from '../helpers/effects';

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    backgroundColor: theme.palette.background.default
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    height: '100vh'
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(0, 3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
})

class MenuScene extends PureComponent {
  state = {
    open: false
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.web3Provider && !this.props.web3Provider) {
      this.props.history.push('/');
    }
  }

  handleOpenDrawer = () => this.setState({ open: true })

  handleCloseDrawer = () => this.setState({ open: false })

  handleDisconnectWallet = () => {
    if (this.props.web3Provider) {
      this.props.unloadWeb3Modal();
    } else {
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        <AppBar
          position="fixed"
          elevation={1}
          className={clsx(this.props.classes.appBar, {
            [this.props.classes.appBarShift]: this.state.open
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleOpenDrawer}
              edge="start"
              className={clsx(this.props.classes.menuButton, {
                [this.props.classes.hide]: this.state.open
              })}
            >
              <Menu />
            </IconButton>
            <div style={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              aria-label="disconnect wallet"
              onClick={this.handleDisconnectWallet}
              edge="end"
            >
              <ExitToApp />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          className={this.props.classes.drawer}
          variant="persistent"
          anchor="left"
          open={this.state.open}
          classes={{
            paper: this.props.classes.drawerPaper
          }}
        >
          <div className={this.props.classes.drawerHeader}>
            <IconButton onClick={this.handleCloseDrawer}>
              {this.props.theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem button>
              <ListItemIcon>
                <Update />
              </ListItemIcon>
              <ListItemText primary="Send Money" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <Restore />
              </ListItemIcon>
              <ListItemText primary="Send Money Wrapper" />
            </ListItem>
          </List>
        </Drawer>
        <main className={clsx(this.props.classes.content, {
          [this.props.classes.contentShift]: this.state.open
        })}>
          <div className={this.props.classes.drawerHeader} />
          {{...this.props.children}}
        </main>
      </div>
    );
  }
}

const mapStateToProps = ({ app }) => ({
  web3Provider: app.web3Provider
});

const mapDispatchToProps = (dispacth) => ({
  loadWeb3Modal: () => dispacth(loadWeb3Modal()),
  unloadWeb3Modal: () => dispacth(unloadWeb3Modal())
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  withStyles(styles),
  withTheme,
  withTransition
)(MenuScene);