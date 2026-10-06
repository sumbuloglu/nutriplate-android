async function start() {
const responses = await Promise.all([fetch('foods.json'), fetch('recipes.json')]);
if (responses.some(response => !response.ok)) throw new Error('Could not load nutrition data.');
const [FOODS, RECIPES] = await Promise.all(responses.map(response => response.json()));

const $=id=>document.getElementById(id);
const fmt=n=>Number(n.toFixed(1)).toLocaleString('en-US');
function total(ingredients,multiplier=1){return ingredients.reduce((sum,[id,g])=>sum.map((v,i)=>v+FOODS[id].v[i]*g/100*multiplier),[0,0,0,0]);}
let custom=[],mode='recipe';
function result(values,title,subtitle){$('result-title').textContent=title;$('result-portions').textContent=subtitle;$('kcal').textContent=Math.round(values[0]).toLocaleString('en-US');['protein','carbs','fat'].forEach((id,i)=>$(id).textContent=fmt(values[i+1])+' g');const energies=[values[1]*4,values[2]*4,values[3]*9],sum=energies.reduce((a,b)=>a+b,0);['protein','carbs','fat'].forEach((id,i)=>$(id+'-bar').style.width=(sum?energies[i]/sum*100:0)+'%');}
function calculateRecipe(){const input=$('servings'),n=input.valueAsNumber;if(!input.checkValidity()||!Number.isFinite(n)){$('recipe-error').textContent='Enter a portion amount from 0.1 to 20, in steps of 0.1.';result([0,0,0,0],'Check the portion amount','No valid result');return;}$('recipe-error').textContent='';const r=RECIPES[Number($('recipe').value)];result(total(r.ingredients,n),r.name,fmt(n)+(n===1?' portion':' portions'));}
function listItem(id,g){const li=document.createElement('li'),name=document.createElement('span'),amount=document.createElement('strong');name.textContent=FOODS[id].name;amount.textContent=fmt(g)+' g';li.append(name,amount);return li;}
function recipeChanged(){const r=RECIPES[Number($('recipe').value)];$('recipe-name').textContent=r.name;$('category').textContent=r.category;$('method').textContent=r.method;$('recipe-ingredients').replaceChildren(...r.ingredients.map(([id,g])=>listItem(id,g)));calculateRecipe();}
function renderCustom(){const list=$('custom-ingredients');list.replaceChildren();if(!custom.length){const li=document.createElement('li');li.className='empty';li.textContent='Your meal is empty. Add your first ingredient above.';list.append(li);}custom.forEach(([id,g],i)=>{const li=listItem(id,g),b=document.createElement('button');b.className='remove';b.textContent='Remove';b.setAttribute('aria-label','Remove '+FOODS[id].name);b.onclick=()=>{custom.splice(i,1);renderCustom();$('food').focus();};li.append(b);list.append(li);});$('clear').hidden=!custom.length;result(total(custom),'Your custom meal',custom.length+' ingredient'+(custom.length===1?'':'s')+' · '+fmt(custom.reduce((a,x)=>a+x[1],0))+' g total');}
function switchMode(next){mode=next;['recipe','custom'].forEach(id=>{const active=id===next;$(id+'-tab').setAttribute('aria-selected',String(active));$(id+'-tab').tabIndex=active?0:-1;$(id+'-panel').hidden=!active;});if(next==='recipe')calculateRecipe();else renderCustom();}
for(const category of [...new Set(RECIPES.map(r=>r.category))]){const group=document.createElement('optgroup');group.label=category;RECIPES.forEach((r,i)=>{if(r.category===category){const o=document.createElement('option');o.value=i;o.textContent=r.name;group.append(o);}});$('recipe').append(group);}
Object.entries(FOODS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,food])=>{const o=document.createElement('option');o.value=id;o.textContent=food.name;$('food').append(o);const tr=document.createElement('tr');[food.name,...food.v].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});$('reference').append(tr);});
$('food').value='egg';$('recipe').onchange=recipeChanged;$('servings').oninput=calculateRecipe;$('calculate-recipe').onclick=calculateRecipe;
['recipe','custom'].forEach(id=>{$(id+'-tab').onclick=()=>switchMode(id);$(id+'-tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'recipe':e.key==='End'?'custom':id==='recipe'?'custom':'recipe';switchMode(next);$(next+'-tab').focus();}};});
$('add-form').onsubmit=e=>{e.preventDefault();const g=$('grams').valueAsNumber;if(!$('grams').checkValidity()||!Number.isFinite(g)){$('custom-error').textContent='Enter a weight from 0.1 to 10,000 grams.';return;}custom.push([$('food').value,g]);$('custom-error').textContent='';renderCustom();};$('clear').onclick=()=>{custom=[];renderCustom();$('food').focus();};recipeChanged();

}
start().catch(error => {
 document.getElementById('recipe-error').textContent = 'Could not load the recipes. Please close and reopen NutriPlate.';
 console.error(error);
});
