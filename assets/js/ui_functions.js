const foundersData = [
  {
    img: "cryptoxpress-team-yogesh.png",
    name: "Yogesh",
    designation: "Founder",
    pillar: "Vision",
    url: 'https://www.linkedin.com/in/yogesh-panjabi'
  },
  {
    img: "cryptoxpress-team-adarsh.png",
    name: "Adarsh",
    designation: "Founder",
    pillar: "Operations",
    url: 'http://linkedin.com/in/adarsh-singh-a12a3612a'
  },
  {
    img: "cryptoxpress-team-sherwin.png",
    name: "Sherwin",
    designation: "Founder",
    pillar: "Product",
    url: 'https://www.linkedin.com/in/sherwintorres/'
  },
  {
    img: "cryptoxpress-team-zeeshan.png",
    name: "Zeeshan",
    designation: "Founder",
    pillar: "Technology",
    url: 'https://www.linkedin.com/in/zeeshan-mohamed-365244120'
  },
  {
    img: "cryptoxpress-team-nilz.png",
    name: "Nilesh",
    designation: "Founder",
    pillar: "Growth",
    url: 'https://www.linkedin.com/in/nileshgpatel'
  },
  {
    img: "cryptoxpress-team-eddie.png",
    name: "Edmund Kim",
    designation: "Founder",
    pillar: "Marketing",
    url: 'https://www.linkedin.com/in/edmundhkim/'
  },
  {
    img: "cryptoxpress-team-avinash.png",
    name: "Avinash",
    designation: "Founder",
    pillar: "Finance",
    url: 'https://www.linkedin.com/in/avinash-rajendra-766257125'
  },
];
const RoadmapData = [
  {
    header: "RETAIL SERVICES",
    body: "Launch of CryptoXpress Retail services, offering the ability to purchase retail items from your favorite local retailers, using cryptocurrencies.",
    footer: "H1 2023",
  },
  {
    header: "TRAVEL SERVICES",
    body: "Launch of CryptoXpress Travel services, offering the ability to make hotel and flight bookings globally, using cryptocurrencies.",
    footer: "H1 2023",
  },
  {
    header: "METAVERSE RETAIL LOCATION",
    body: "Launch of the first CryptoXpress Metaverse outlet, offering the ability to purchase cryptocurrencies, NFTs, retail products and travel services in the Metaverse.",
    footer: "H2 2023",
  },
  {
    header: "E-BANKING SERVICES (EU)",
    body: "Launch of CryptoXpress E-banking services, offering e-banking solutions such as customer fiat IBAN accounts and cryptocurrency debit cards.",
    footer: "H2 2023",
  },
  {
    header: "Gaming NFTs",
    body: "Launch of CryptoXpress Gaming NFT marketplace, offering tradeable in-game items for AAA Windows games via NFTs.",
    footer: "H2 2023",
  },
];
const AdvisoryData = [
  {
    img: "cryptoxpress-team-min.png",
    name: "Min",
    role: "Venture Capital",
    url: "https://www.linkedin.com/in/minkimd14/",
  },
  {
    img: "cryptoxpress-team-mardo.png",
    name: "Mardo",
    role: "Industry",
    url: "https://ee.linkedin.com/in/mardo-soo-00a05ab0",
  },
  {
    img: "cryptoxpress-team-randal.png",
    name: "Randall",
    role: "Legal",
    url: "https://www.linkedin.com/in/randallwjohnsonus",
  },
  {
    img: "cryptoxpress-team-eric.png",
    name: "Eric",
    role: "Security",
    url: "https://www.linkedin.com/in/eric-anderson-b407387",
  },
  {
    img: "cryptoxpress-team-will.png",
    name: "Will",
    role: "IDO",
    url: "https://tokenova.io/",
  },
  {
    img: "cryptoxpress-team-nathan.png",
    name: "Nathan",
    role: "Blockchain",
    url: "https://www.linkedin.com/in/nathan-kkk",
  },
  {
    img: "cryptoxpress-team-praj.png",
    name: "Prajwal",
    role: "NFT",
    url: "https://www.linkedin.com/in/thepraj",
  },
];

const populate = () => {
  populateFounder();
  populateRoadmap();
  populateAdvisory();
};

const prev = function () {
  document.getElementById("left").click();
};
const next = function () {
  document.getElementById("right").click();
};

const prevRoadmap = function () {
  document.getElementById("leftRoadmap").click();
};
const nextRoadmap = function () {
  document.getElementById("nextRoadmap").click();
};
const prevAdvisory = function () {
  document.getElementById("leftAdvisory").click();
};
const nextAdvisory = function () {
  document.getElementById("nextAdvisory").click();
};

const populateFounder = () => {
  let set = 0;
  const nodes = [];
  for (let i = 0; i < foundersData.length; i++) {
    let listItem = document.createElement("li");
    listItem.setAttribute("data-target", "#slider");
    listItem.setAttribute("data-slide-to", set);
    set++;
    if (i == 0) {
      listItem.classList.add("active");
    }

    let slider = document.getElementById("founder-indicator");
    slider.append(listItem);

    let founders = document.createElement("div");
    founders.classList.add("founders-slide");
    let j = i;
    let x = Math.floor(
      document.getElementById("founder-population-point").clientWidth / 200
    );
    console.log(x);
    for (; j < i + x && j < foundersData.length; j++) {
      var item = foundersData[j];
      var founder = document.createElement("div");
      var image = document.createElement("img");
      var name = document.createElement("div");
      var designation = document.createElement("div");
      var founder_part = document.createElement("div");
      var pillar = document.createElement("div");

      name.classList.add("founder-name");
      designation.classList.add("designation");
      image.classList.add("founder-image");
      founder.classList.add("founder");
      founder_part.classList.add("founder-part");
      pillar.classList.add("founder-pillar");

      image.src = "assets/images/team/" + item.img;
      name.innerText += item.name;
      designation.innerText += item.designation;
      pillar.innerText += item.pillar;
      founder_part.appendChild(name);
      founder_part.appendChild(designation);
      founder_part.appendChild(pillar);

      founder.appendChild(image);
      founder.appendChild(founder_part);
      if (j == i) {
        founder.style.marginLeft = "0px";
      }
      founders.append(founder);
      nodes.push({ card: founder, url: item.url });
    }

    const d_block = document.createElement("div");
    d_block.classList.add("d-flex", "w-100", "justify-content-center");
    const md = document.createElement("div");
    md.classList.add("col-md-30");
    md.append(founders);
    d_block.append(md);

    var carouselString = "carousel-item";
    const nod = document.createElement("div");
    nod.classList.add(carouselString);
    nod.append(d_block);

    const point = document.getElementById("founder-population-point");
    point.append(nod);
    i = j - 1;
  }
  const point = document.getElementById("founder-population-point");
  point.firstElementChild?.classList.add("active");
  console.log(
    $("#slider").carousel({
      interval: false,
    })
  );
  nodes.forEach(({ card, url }) => {
    function fun() {
      window.open(url, '_blank');
    };
    card.addEventListener('click', fun, false);
  });
};

const populateRoadmap = () => {
  let set = 0;
  for (let i = 0; i < RoadmapData.length; i++) {
    let listItem = document.createElement("li");
    listItem.setAttribute("data-target", "#sliderRoadmap");
    listItem.setAttribute("data-slide-to", set);
    set++;
    if (i == 0) {
      listItem.classList.add("active");
    }

    let slider = document.getElementById("roadmap-indicator");
    slider.append(listItem);
    let roadmaps = document.createElement("div");
    roadmaps.classList.add("roadmap-slide");
    let j = i;
    let x = Math.floor(
      document.getElementById("roadmap-population-point").clientWidth / 200
    );
    for (; j < i + x && j < RoadmapData.length; j++) {
      var item = RoadmapData[j];
      let header = document.createElement("div");
      let body = document.createElement("div");
      let footer = document.createElement("div");
      let milestone = document.createElement("div");
      let card = document.createElement("div");

      header.innerText += item.header;
      body.innerText += item.body;
      footer.innerText += item.footer;

      header.classList.add("roadmap-text");
      body.classList.add("roadmap-text");
      footer.classList.add("roadmap-foot");
      milestone.append(header, body, footer);
      milestone.classList.add("milestones");
      if (j == i) {
        milestone.style.marginLeft = "0px";
      }
      roadmaps.append(milestone);
    }
    const d_block = document.createElement("div");
    d_block.classList.add("d-flex", "w-100", "justify-content-center");
    const md = document.createElement("div");
    md.classList.add("col-md-30");
    md.append(roadmaps);
    d_block.append(md);

    var carouselString = "carousel-item";
    const nod = document.createElement("div");
    nod.classList.add(carouselString);
    nod.append(d_block);

    const point = document.getElementById("roadmap-population-point");
    point.append(nod);
    i = j - 1;
  }
  const point = document.getElementById("roadmap-population-point");
  point.firstElementChild?.classList.add("active");
  console.log(
    $("#sliderRoadmap").carousel({
      interval: false,
    })
  );
};

const populateAdvisory = () => {
  let set = 0;
  const links = [];
  for (let i = 0; i < AdvisoryData.length; i++) {
    let listItem = document.createElement("li");
    listItem.setAttribute("data-target", "#sliderAdvisory");
    listItem.setAttribute("data-slide-to", set);
    set++;
    if (i == 0) {
      listItem.classList.add("active");
    }

    let slider = document.getElementById("advisory-indicator");
    slider.append(listItem);
    let advisors = document.createElement("div");
    advisors.classList.add("advisory-slide");
    let j = i;
    let x = Math.floor(
      document.getElementById("advisory-population-point").clientWidth / 200
    );
    for (; j < i + x && j < AdvisoryData.length; j++) {
      var item = AdvisoryData[j];
      console.log(item);
      let image = document.createElement("img");
      image.classList.add("member-img");
      image.src = "assets/images/team/" + item.img;

      let name = document.createElement("div");
      name.classList.add("member-name");
      name.innerText += item.name;

      let role = document.createElement("div");
      role.innerText = item.role;
      role.classList.add("memberRole");

      let nameComponent = document.createElement("div");
      nameComponent.classList.add("memberName");
      nameComponent.append(name, role);

      let linkedIn = document.createElement("img");
      linkedIn.classList.add("linkedinLogo");
      linkedIn.src =
        item.name == "Will"
          ? "assets/images/cx-tokenova-icon.jpg"
          : "assets/images/linkedin-icon.png";

      let member = document.createElement("div");
      member.classList.add("member");
      member.append(image, nameComponent, linkedIn);

      if (j == i) {
        member.style.marginLeft = "0px";
      }

      advisors.append(member);
      links.push({ node: linkedIn, url: item.url });
    }
    const d_block = document.createElement("div");
    d_block.classList.add("d-flex", "w-100", "justify-content-center");
    const md = document.createElement("div");
    md.classList.add("col-md-30");
    md.append(advisors);
    d_block.append(md);

    var carouselString = "carousel-item";
    const nod = document.createElement("div");
    nod.classList.add(carouselString);
    nod.append(d_block);

    const point = document.getElementById("advisory-population-point");
    point.append(nod);
    i = j - 1;
  }
  const point = document.getElementById("advisory-population-point");
  point.firstElementChild?.classList.add("active");
  console.log(
    $("#sliderAdvisory").carousel({
      interval: false,
    })
  );
  links.forEach((val) => {
    function fun() {
      window.open(val.url, "_blank");
    }
    val.node.addEventListener("click", fun, false);
  });
};
