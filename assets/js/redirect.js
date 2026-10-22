'use strict';
const target=document.body.dataset.redirect;if(target){const url=new URL(target,location.href);if(url.origin===location.origin){url.search=location.search;location.replace(url.href);}}
