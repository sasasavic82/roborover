import React from 'react';
import ReactDOM from 'react-dom';
import './assets/scss/style.scss';
import 'semantic-ui-css/semantic.min.css';

const RoboroverApp = require('./roborover').default;

ReactDOM.render(<RoboroverApp />, document.getElementById('root'));
