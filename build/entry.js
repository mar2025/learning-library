import angular from 'angular';
import 'angular-animate';
import 'angular-aria';
import 'angular-messages';
import 'angular-sanitize';
import 'angular-material';

import $ from 'jquery';
import showdown from 'showdown';

// Expose globals expected by legacy code
window.angular = angular;
window.$ = $;
window.jQuery = $;
window.showdown = showdown;

// Bring in the existing workshop logic (uses global Angular & showdown)
import '../workshops/common-content/js/workshop.js';