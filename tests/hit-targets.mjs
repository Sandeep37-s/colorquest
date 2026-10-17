import {chromium} from '@playwright/test';
import {levels,renderSVG} from '../src/levels.js';
const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({viewport:{width:900,height:700}});let missing=[];
for(const l of levels){await p.setContent('<div style="width:850px">'+renderSVG(l,{})+'</div>');const result=await p.evaluate(()=>[...document.querySelectorAll('[data-region]')].filter(el=>{const b=el.getBoundingClientRect();for(let y=.08;y<1;y+=.07)for(let x=.08;x<1;x+=.07){if(document.elementFromPoint(b.x+b.width*x,b.y+b.height*y)===el)return false;}return true;}).map(el=>el.dataset.region));if(result.length)missing.push({level:l.title,regions:result});}console.log(JSON.stringify(missing));await b.close();
