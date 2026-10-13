async function start() {
const responses = await Promise.all([fetch('foods.json'), fetch('recipes.json')]);
if (responses.some(response => !response.ok)) throw new Error('Could not load nutrition data.');
const [FOODS, RECIPES] = await Promise.all(responses.map(response => response.json()));

const $=id=>document.getElementById(id);

const ALLERGENS={egg:'Egg',milk:'Milk',gluten:'Cereals containing gluten (wheat, oats, barley, rye)',peanut:'Peanuts',nuts:'Tree nuts',fish:'Fish',soy:'Soy',sesame:'Sesame',celery:'Celery',mustard:'Mustard',crustaceans:'Crustaceans',molluscs:'Molluscs',lupin:'Lupin',sulphites:'Sulphites'};
const KNOWN={egg:['egg'],milk:['milk'],yogurt:['milk'],feta:['milk'],cheddar:['milk'],butter:['milk'],bread:['gluten'],pasta:['gluten'],bulgur:['gluten'],flour:['gluten'],oats:['gluten'],almonds:['nuts'],walnuts:['nuts'],peanutbutter:['peanut'],tahini:['sesame'],salmon:['fish'],tuna:['fish']};
const LABEL_CHECK={bread:['egg','milk','soy','sesame','nuts','lupin'],pasta:['egg'],peanutbutter:['nuts','soy'],oats:['gluten']};
let selectedAllergens=new Set();
function allergenInfo(ingredients){
 const known=new Set(),possible=new Set();
 for(const [id] of ingredients){(KNOWN[id]||[]).forEach(a=>known.add(a));(LABEL_CHECK[id]||[]).forEach(a=>possible.add(a));}
 return {known:[...known],possible:[...possible].filter(a=>!known.has(a))};
}
function swapsFor(id,recipe){
 const idea=(name,description,allergens=[])=>({name,description,allergens});
 if(id==='egg'){
  if(recipe && recipe.name==='Blueberry Oat Pancakes')return [idea('Mashed banana','For each egg, FARE suggests about ¼ cup mashed banana plus ½ teaspoon baking powder for baking. In these pancakes, this is a trial option: it adds sweetness and may change texture. Check the baking-powder label.')];
  return [idea('Plain tofu','For scrambled eggs or menemen, crumble tofu and cook with the vegetables. For toast, use cooked tofu slices. For an omelette, make a tofu-and-vegetable scramble instead: it will not set like an egg omelette. Contains soy.',['soy'])];
 }
 if(id==='butter')return [idea('Olive oil','For sautéing, use olive oil as a cooking alternative. For baking, follow a recipe designed for oil; quantities and texture differ.')];
 if(id==='milk')return [idea('Rice drink','Try a plain rice drink in porridge, smoothies or soup. Choose a product whose ingredients and allergen label suit every selected allergy; brands vary.')];
 if(id==='yogurt')return [idea('Plant-based yogurt','Choose a rice-based or other plant yogurt after checking its full label. Soy and nut yogurts introduce their own allergens. Texture and protein content differ.')];
 if(id==='feta'||id==='cheddar')return [idea('Avocado or omit the cheese','In bowls, toast or potato toppings, avocado can add creaminess. In an omelette or hot dish, omitting cheese may work better; avocado will not melt like cheese.')];
 if(id==='bread')return [idea('Verified wheat-free, gluten-free bread','Choose bread labelled for the allergen you need to avoid and inspect egg, milk, soy, sesame, nut and lupin ingredients. A gluten-free label alone does not prove wheat-free.')];
 if(id==='pasta')return [idea('Rice- or corn-based pasta','Use a product verified to exclude the allergens you selected, including wheat and egg when applicable. Follow its own cooking instructions.')];
 if(id==='bulgur')return [idea('Cooked rice or quinoa','These can replace bulgur in a bowl or salad. Cooking time, liquid and texture differ. Check packaged products for cross-contact statements.')];
 if(id==='oats')return [idea('Rice flakes','Try rice flakes for porridge. For pancakes or cookies, use a recipe designed for rice flour or flakes rather than making an equal-weight swap. Oats are included in the cereal group; certified gluten-free oats are not a solution to oat allergy.')];
 if(id==='flour')return [idea('Cornstarch for soup thickening','For the mushroom soup, try a cornstarch slurry instead of wheat flour; add gradually because thickening strength differs. Check its label.')];
 if(id==='almonds'||id==='walnuts')return [idea('Toasted seeds or omit the topping','Plain pumpkin or sunflower seeds can add crunch if tolerated. Check their labels and cross-contact statements. Seeds can also cause allergies.')];
 if(id==='peanutbutter')return [idea('Sunflower-seed butter','For toast or smoothies, consider plain sunflower-seed butter if tolerated, after checking its full label. Cookies need a recipe-specific trial because consistency differs.')];
 if(id==='tahini')return [idea('Omit tahini','For hummus, blend chickpeas with lemon and a little water or olive oil. For a bowl dressing, try lemon and olive oil. The flavor and texture will change.')];
 if(id==='salmon'||id==='tuna')return [idea('Cooked chickpeas or chicken','For bowls or salads, use cooked chickpeas or cooked chicken as a different protein ingredient. Cook chicken fully before assembling. These are different recipes, not nutritionally equivalent swaps.')];
 return [];
}
function renderAllergens(){
 const recipe=mode==='recipe'?RECIPES[Number($('recipe').value)]:null;
 const ingredients=recipe?recipe.ingredients:custom;
 const out=$('allergy-results');out.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=recipe?recipe.name:'Your custom meal';out.append(heading);
 if(!ingredients.length){const p=document.createElement('p');p.textContent='Add an ingredient to see its allergen information.';out.append(p);return;}
 const info=allergenInfo(ingredients),badges=document.createElement('div');badges.className='allergen-badges';
 for(const a of info.known){const badge=document.createElement('span');badge.textContent=ALLERGENS[a];if(selectedAllergens.has(a))badge.className='conflict';badges.append(badge);}out.append(badges);
 const status=document.createElement('p');status.className='allergy-state';
 const matches=[...info.known,...info.possible].filter(a=>selectedAllergens.has(a));
 status.textContent=selectedAllergens.size?(matches.length?'Selected allergen matches or product-label checks: '+matches.map(a=>ALLERGENS[a]).join(', '):'No selected allergen identified in the listed ingredients. Labels and cross-contact still need checking.'):(info.known.length?'Allergen groups identified in the listed ingredients. Select your allergens above for alternatives.':'No listed allergen group identified. This is not a safety guarantee.');out.append(status);
 if(info.possible.length){const p=document.createElement('p');p.className='subtle';p.textContent='Depending on the product, also check: '+info.possible.map(a=>ALLERGENS[a]).join(', ')+'. Bread and pasta formulas vary; this is not an exhaustive label check.';out.append(p);}
 const seen=new Set();
 for(const [id] of ingredients){
  if(seen.has(id))continue;seen.add(id);
  const direct=(KNOWN[id]||[]).filter(a=>selectedAllergens.has(a));
  const possible=(LABEL_CHECK[id]||[]).filter(a=>selectedAllergens.has(a)&&!direct.includes(a));
  if(!direct.length&&!possible.length)continue;
  const card=document.createElement('div');card.className='swap-card';const title=document.createElement('h3');title.textContent=FOODS[id].name;card.append(title);
  const reason=document.createElement('p');reason.textContent=(direct.length?'Listed allergen: '+direct.map(a=>ALLERGENS[a]).join(', ')+'. ':'')+(possible.length?'Product label check: '+possible.map(a=>ALLERGENS[a]).join(', ')+'.':'');card.append(reason);
  const candidates=swapsFor(id,recipe).filter(swap=>!swap.allergens.some(a=>selectedAllergens.has(a)));
  for(const swap of candidates){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=swap.name+' — ';p.append(strong,document.createTextNode(swap.description));card.append(p);}
  if(!candidates.length){const p=document.createElement('p');p.textContent='No alternative in this guide fits all selected allergens. Choose a separately formulated recipe with your clinician or dietitian.';card.append(p);}out.append(card);
 }
}
for(const [id,name] of Object.entries(ALLERGENS)){
 const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=id;input.id='allergy-'+id;
 input.onchange=()=>{input.checked?selectedAllergens.add(id):selectedAllergens.delete(id);renderAllergens();};label.append(input,document.createTextNode(name));$('allergy-choices').append(label);
}
$('clear-allergies').onclick=()=>{selectedAllergens.clear();Object.keys(ALLERGENS).forEach(id=>$('allergy-'+id).checked=false);renderAllergens();};

const fmt=n=>Number(n.toFixed(1)).toLocaleString('en-US');
function total(ingredients,multiplier=1){return ingredients.reduce((sum,[id,g])=>sum.map((v,i)=>v+FOODS[id].v[i]*g/100*multiplier),[0,0,0,0]);}
let custom=[],mode='recipe';
function result(values,title,subtitle){$('result-title').textContent=title;$('result-portions').textContent=subtitle;$('kcal').textContent=Math.round(values[0]).toLocaleString('en-US');['protein','carbs','fat'].forEach((id,i)=>$(id).textContent=fmt(values[i+1])+' g');const energies=[values[1]*4,values[2]*4,values[3]*9],sum=energies.reduce((a,b)=>a+b,0);['protein','carbs','fat'].forEach((id,i)=>$(id+'-bar').style.width=(sum?energies[i]/sum*100:0)+'%');}
function calculateRecipe(){const input=$('servings'),n=input.valueAsNumber;if(!input.checkValidity()||!Number.isFinite(n)){$('recipe-error').textContent='Enter a portion amount from 0.1 to 20, in steps of 0.1.';result([0,0,0,0],'Check the portion amount','No valid result');return;}$('recipe-error').textContent='';const r=RECIPES[Number($('recipe').value)];result(total(r.ingredients,n),r.name,fmt(n)+(n===1?' portion':' portions'));}
function listItem(id,g){const li=document.createElement('li'),name=document.createElement('span'),amount=document.createElement('strong');name.textContent=FOODS[id].name;amount.textContent=fmt(g)+' g';li.append(name,amount);return li;}
function recipeChanged(){const r=RECIPES[Number($('recipe').value)];$('recipe-name').textContent=r.name;$('category').textContent=r.category;$('method').textContent=r.method;$('recipe-ingredients').replaceChildren(...r.ingredients.map(([id,g])=>listItem(id,g)));calculateRecipe();renderAllergens();}
function renderCustom(){const list=$('custom-ingredients');list.replaceChildren();if(!custom.length){const li=document.createElement('li');li.className='empty';li.textContent='Your meal is empty. Add your first ingredient above.';list.append(li);}custom.forEach(([id,g],i)=>{const li=listItem(id,g),b=document.createElement('button');b.className='remove';b.textContent='Remove';b.setAttribute('aria-label','Remove '+FOODS[id].name);b.onclick=()=>{custom.splice(i,1);renderCustom();$('food').focus();};li.append(b);list.append(li);});$('clear').hidden=!custom.length;result(total(custom),'Your custom meal',custom.length+' ingredient'+(custom.length===1?'':'s')+' · '+fmt(custom.reduce((a,x)=>a+x[1],0))+' g total');renderAllergens();}
function switchMode(next){mode=next;['recipe','custom'].forEach(id=>{const active=id===next;$(id+'-tab').setAttribute('aria-selected',String(active));$(id+'-tab').tabIndex=active?0:-1;$(id+'-panel').hidden=!active;});if(next==='recipe')calculateRecipe();else renderCustom();renderAllergens();}
function matchingRecipes(ingredient){return RECIPES.map((recipe,index)=>({recipe,index})).filter(({recipe})=>!ingredient||recipe.ingredients.some(([id])=>id===ingredient));}
function filterRecipes(){
 const ingredient=$('ingredient-filter').value, matches=matchingRecipes(ingredient), previous=$('recipe').value;
 $('recipe').replaceChildren();
 for(const category of [...new Set(matches.map(({recipe})=>recipe.category))]){
  const group=document.createElement('optgroup');group.label=category;
  matches.filter(({recipe})=>recipe.category===category).forEach(({recipe,index})=>{const option=document.createElement('option');option.value=String(index);option.textContent=recipe.name;group.append(option);});$('recipe').append(group);
 }
 $('recipe').value=matches.some(({index})=>String(index)===previous)?previous:String(matches[0].index);
 $('filter-count').textContent=matches.length+' matching recipe'+(matches.length===1?'':'s')+(ingredient?' with '+FOODS[ingredient].name.toLowerCase(): ' · full collection');
 recipeChanged();
}
Object.entries(FOODS).filter(([id])=>id!=='water'&&matchingRecipes(id).length).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,food])=>{const option=document.createElement('option');option.value=id;option.textContent=food.name;$('ingredient-filter').append(option);});
$('ingredient-filter').onchange=filterRecipes;

Object.entries(FOODS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,food])=>{const o=document.createElement('option');o.value=id;o.textContent=food.name;$('food').append(o);const tr=document.createElement('tr');[food.name,...food.v].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});$('reference').append(tr);});
$('food').value='egg';$('recipe').onchange=recipeChanged;$('servings').oninput=calculateRecipe;$('calculate-recipe').onclick=()=>{calculateRecipe();if($('recipe-error').textContent){$('servings').focus();return;}const panel=$('nutrition-results');panel.focus({preventScroll:true});panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});};
['recipe','custom'].forEach(id=>{$(id+'-tab').onclick=()=>switchMode(id);$(id+'-tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'recipe':e.key==='End'?'custom':id==='recipe'?'custom':'recipe';switchMode(next);$(next+'-tab').focus();}};});
$('add-form').onsubmit=e=>{e.preventDefault();const g=$('grams').valueAsNumber;if(!$('grams').checkValidity()||!Number.isFinite(g)){$('custom-error').textContent='Enter a weight from 0.1 to 10,000 grams.';return;}custom.push([$('food').value,g]);$('custom-error').textContent='';renderCustom();};$('clear').onclick=()=>{custom=[];renderCustom();$('food').focus();};filterRecipes();

let welcomeStep=0,welcomeGoal='recipes',welcomeCategory='';
const welcomeIds=['welcome-home','welcome-preference','welcome-category','welcome-allergies'];
function showWelcomeStep(step){welcomeStep=step;welcomeIds.forEach((id,index)=>$(id).hidden=index!==step);$('step-progress').hidden=step===0;$('step-label').textContent=step===0?'GOOD FOOD. A LITTLE CLARITY.':'A LITTLE ABOUT YOUR PLATE · '+step+' / 3';document.querySelectorAll('#step-progress i').forEach((dot,index)=>dot.classList.toggle('active',index<step));const heading=$(welcomeIds[step]).querySelector('h1');if(heading)heading.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function finishWelcome(skipped=false){
 $('welcome').hidden=true;$('main-site').hidden=false;
 if(!skipped){
  if(welcomeCategory){$('ingredient-filter').value='';filterRecipes();const index=RECIPES.findIndex(r=>r.category===welcomeCategory);if(index>=0){$('recipe').value=String(index);recipeChanged();}}
  switchMode(welcomeGoal==='custom'?'custom':'recipe');
 }
 try{sessionStorage.setItem('nutriplate-welcome-complete','yes');}catch(_){}
 window.scrollTo({top:0,behavior:'instant'});$('main-site').querySelector('h1').setAttribute('tabindex','-1');$('main-site').querySelector('h1').focus({preventScroll:true});
 if(!skipped&&welcomeGoal==='allergy')document.querySelector('.allergy-panel').scrollIntoView({block:'start'});
}
$('begin-welcome').onclick=()=>showWelcomeStep(1);
$('skip-welcome').onclick=()=>finishWelcome(true);
$('finish-welcome').onclick=()=>finishWelcome();
$('restart-welcome').onclick=()=>{$('main-site').hidden=true;$('welcome').hidden=false;showWelcomeStep(0);};
document.querySelectorAll('[data-next]').forEach(button=>button.onclick=()=>showWelcomeStep(Number(button.dataset.next)));
document.querySelectorAll('[data-back]').forEach(button=>button.onclick=()=>showWelcomeStep(Number(button.dataset.back)));
document.querySelectorAll('[data-goal]').forEach(button=>button.onclick=()=>{welcomeGoal=button.dataset.goal;document.querySelectorAll('[data-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
document.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{welcomeCategory=button.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
function syncWelcomeAllergies(){for(const id of Object.keys(ALLERGENS)){$('welcome-allergy-'+id).checked=selectedAllergens.has(id);}}
for(const [id,name] of Object.entries(ALLERGENS)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.id='welcome-allergy-'+id;input.onchange=()=>{input.checked?selectedAllergens.add(id):selectedAllergens.delete(id);$('allergy-'+id).checked=input.checked;renderAllergens();};label.append(input,document.createTextNode(name));$('welcome-allergy-choices').append(label);const original=$('allergy-'+id).onchange;$('allergy-'+id).onchange=()=>{original();syncWelcomeAllergies();};}
const clearOriginal=$('clear-allergies').onclick;$('clear-allergies').onclick=()=>{clearOriginal();syncWelcomeAllergies();};
try{if(sessionStorage.getItem('nutriplate-welcome-complete')==='yes')finishWelcome(true);}catch(_){}

}
start().catch(error => {
 document.getElementById('welcome').hidden = true;
 document.getElementById('main-site').hidden = false;
 document.getElementById('recipe-error').textContent = 'Could not load the recipes. Please close and reopen NutriPlate.';
 console.error(error);
});
