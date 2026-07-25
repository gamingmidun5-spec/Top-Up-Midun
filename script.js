// ==========================
// MIDUUN TOP UP
// ==========================

// Animasi muncul saat halaman dibuka

window.addEventListener("load", ()=>{

document.body.style.opacity="1";

});

// Efek hover hero

const hero=document.querySelector(".right img");

document.addEventListener("mousemove",(e)=>{

let x=(window.innerWidth/2-e.pageX)/40;

let y=(window.innerHeight/2-e.pageY)/40;

hero.style.transform=
`translate(${x}px,${y}px)`;

});

// Animasi tombol

const tombol=document.querySelectorAll(".btn1,.btn2,.card");

tombol.forEach(item=>{

item.addEventListener("mouseenter",()=>{

item.style.transform="scale(1.05)";

});

item.addEventListener("mouseleave",()=>{

item.style.transform="scale(1)";

});

});
