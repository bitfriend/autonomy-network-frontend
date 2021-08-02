import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

export const withTransition = (Component) => ({
  children,
  ...props
}) => (
  <CSSTransitionGroup
    transitionAppear={true}
    transitionAppearTimeout={600}
    transitionEnterTimeout={600}
    transitionLeaveTimeout={200}
    transitionName={props.match.path === '/' ? 'SlideOut' : 'SlideIn'}
  >
    <Component {...props}>{{...children}}</Component>
  </CSSTransitionGroup>
)
