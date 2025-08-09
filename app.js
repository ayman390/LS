
const $ = s => document.querySelector(s);
const app = $("#app");

const state = {
  q: "", guests: 1, currency: "USD", dark: false,
  filters: { verified:false, instant:false, under5:false, sort:"best" },
  saved: JSON.parse(localStorage.getItem("saved")||"[]"),
};
$("#cur").textContent = state.currency;

const DATA = [
  { id:1, title:"DXB → JED (5kg)", price:45, rating:4.8, reviews:132, verified:true, instant:true, kg:5, img:"icons/logo.png" },
  { id:2, title:"AUH → CAI (3kg, evening flight)", price:32, rating:4.5, reviews:77, verified:true, instant:false, kg:3, img:"icons/logo.png" },
  { id:3, title:"RUH → DXB (8kg)", price:60, rating:4.9, reviews:210, verified:false, instant:true, kg:8, img:"icons/logo.png" },
  { id:4, title:"JED → IST (4kg, tomorrow)", price:38, rating:4.4, reviews:51, verified:true, instant:true, kg:4, img:"icons/logo.png" }
];

function route(v){ history.replaceState({}, "", "#"+v); render(v); }
window.addEventListener("hashchange",()=>render());
window.addEventListener("load",()=>render());

function render(v){
  v = v || (location.hash||"#search").slice(1);
  if(v==="search") return viewSearch();
  if(v.startsWith("detail")) return viewDetail(parseInt(new URLSearchParams(location.hash.split('?')[1]).get('id')));
  if(v==="saved") return viewSaved();
  if(v==="map") return viewMap();
  if(v==="profile") return viewProfile();
}

function card(item){
  const saved = state.saved.includes(item.id);
  return `
  <div class="card">
    <img src="${item.img}" alt="image">
    <div class="p">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div style="font-weight:700">${item.title}</div>
        <div class="rating">★ ${item.rating}</div>
      </div>
      <div class="badges">
        ${item.verified?'<span class="badge">Verified</span>':''}
        ${item.instant?'<span class="badge">Instant</span>':''}
        <span class="badge">${item.kg}kg</span>
        <span class="badge">${item.reviews} reviews</span>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="price">$ ${item.price} <span style="font-weight:400;color:#666">/ trip</span></div>
        <div class="actions" style="justify-content:flex-end">
          <button class="btn gray" onclick="toggleSave(${item.id})">${saved?'Saved':'Save'}</button>
          <button class="btn" onclick="openDetail(${item.id})">View</button>
        </div>
      </div>
    </div>
  </div>`;
}

function viewSearch(){
  app.innerHTML = '<div class="card skeleton" style="height:80px"></div>';
  setTimeout(()=>{
    let arr = DATA.slice();
    if(state.q) arr = arr.filter(x=>x.title.toLowerCase().includes(state.q.toLowerCase()));
    app.innerHTML = `
      <div class="card" style="padding:10px">
        <div class="row">
          <input id="loc" placeholder="City / Airport" value="${state.q}">
          <button class="btn" onclick="doSearch()">Search</button>
        </div>
        <div style="margin-top:8px">Guests: <b id="g">${state.guests}</b></div>
      </div>
      ${arr.map(card).join('')}
    `;
  }, 200);
}

function openDetail(id){ route("detail?id="+id); }

function viewDetail(id){
  const x = DATA.find(d=>d.id===id);
  if(!x) return app.innerHTML = "<div class='card'>Not found</div>";
  const saved = state.saved.includes(x.id);
  app.innerHTML = `
    <div class="card"><img src="${x.img}"><div class="p">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:700">${x.title}</div>
        <div class="rating">★ ${x.rating} (${x.reviews} reviews)</div>
      </div>
      <div class="badges">
        ${x.verified?'<span class="badge">Verified</span>':''}
        ${x.instant?'<span class="badge">Instant</span>':''}
        <span class="badge">${x.kg}kg</span>
      </div>
      <p class="muted">Amenities: In-app chat, ID verification, dispute support.</p>
      <div class="row">
        <button class="btn gray" onclick="toggleSave(${x.id})">${saved?'Saved':'Save'}</button>
        <button class="btn" onclick="startBooking(${x.id})">Request ($${x.price})</button>
      </div>
    </div></div>
  `;
}

function toggleSave(id){
  const i = state.saved.indexOf(id);
  if(i>-1) state.saved.splice(i,1); else state.saved.push(id);
  localStorage.setItem("saved", JSON.stringify(state.saved));
  render();
}

function startBooking(id){ alert("Booking step 1 (demo)."); }

function viewSaved(){
  const items = DATA.filter(d=>state.saved.includes(d.id));
  app.innerHTML = items.length? items.map(card).join("") : "<div class='card' style='padding:12px'>No saved items yet.</div>";
}

function viewMap(){
  const q = encodeURIComponent(state.q||"airport");
  app.innerHTML = `
    <div class="card" style="padding:12px">
      <b>Map preview</b>
      <p class="muted">Open in Maps for "${state.q||'airports'}"</p>
      <a class="btn" href="https://www.google.com/maps/search/${q}" target="_blank">Open Maps</a>
    </div>`;
}

function viewProfile(){
  app.innerHTML = `
    <div class="card" style="padding:12px">
      <b>Profile</b>
      <div class="row" style="margin-top:8px">
        <button class="btn gray" onclick="toggleDark()">Toggle theme</button>
        <button class="btn gray" onclick="toggleCurrency()">Currency: ${state.currency}</button>
      </div>
      <div class="muted" style="margin-top:8px">Demo profile. Add auth later.</div>
    </div>`;
}

function doSearch(){ state.q = $("#loc").value.trim(); render(); }
function setGuests(delta){ state.guests = Math.max(1, state.guests + delta); const g=$("#g"); if(g) g.textContent=state.guests; }
function toggleCurrency(){ state.currency = state.currency==="USD" ? "SAR" : "USD"; $("#cur").textContent = state.currency; render(); }
function toggleDark(){ state.dark = !state.dark; document.body.style.background = state.dark ? "#111" : "var(--bg)"; document.body.style.color = state.dark ? "#eee" : "var(--ink)"; render(); }

function openFilters(){ document.getElementById("sheet").classList.add("show"); }
function closeFilters(e){ if(e.target.id==="sheet") document.getElementById("sheet").classList.remove("show"); }
function applyFilters(){ document.getElementById("sheet").classList.remove("show"); render(); }
