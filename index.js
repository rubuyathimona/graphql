const showDetails = (data) => {
    let user = document.getElementById("userInfo")
  console.log("data:", data.attrs.email)
  console.log("data:", data  )
    const nameElement = document.getElementById('userName');
    const fullNameElement = document.getElementById('userFullName');
    const phoneElement = document.getElementById('userPhone');
    const emailElement = document.getElementById('userEmail');
    const addressElement = document.getElementById('userAddress');
    const totalXp = document.getElementById('totalXp');
    const givenXp = document.getElementById('givenXp');
    const receivedXp = document.getElementById('receivedXp');

    if (nameElement) nameElement.textContent = `Username: ${data.login}`;
    if (fullNameElement) fullNameElement.textContent = `Full Name: ${data.attrs.firstName} ${data.attrs.lastName}`;
    if (phoneElement) phoneElement.textContent = `Phone: ${data.attrs.tel}`;
    if (emailElement) emailElement.textContent = `Email: ${data.attrs.email}`;
    if (addressElement) addressElement.textContent = `Address: ${data.attrs.addressStreet}, ${data.attrs.addressCity}, ${data.attrs.addressCountry}`;
    if (totalXp) totalXp.textContent = `Total XP: ${Math.round(data.auditRatio)}`;
    if (givenXp) givenXp.textContent = `Done: ${(data.totalUp / 1000000).toFixed(2)} MB`;
    if (receivedXp) receivedXp.textContent = `Received: ${(data.totalDown / 1000000).toFixed(2)} MB`;
    const projectData = data.xps.map(xp => {
        const progress = data.progresses.find(p => p.path === xp.path);
        return {
            name: xp.path.split('/').pop() // Get the last part of the path as the project name
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase()),
            amount: xp.amount/1000,
            date: progress ? new Date(progress.createdAt) : null
        };
    }).filter(project => project.date !== null); // Remove projects without a corresponding date

    // Sort projects by date
    projectData.sort((a, b) => a.date - b.date);

    createProjectChart(projectData)


    const skillColors = {
        'skill_ai': '#FF6B6B',
        'skill_algo': '#4ECDC4',
        'skill_back-end': '#45B7D1',
        'skill_css': '#1A535C',
        'skill_docker': '#4D9DE0',
        'skill_front-end': '#E15554',
        'skill_game': '#7768AE',
        'skill_go': '#3BB273',
        'skill_html': '#E1BC29',
        'skill_js': '#FFA630',
        'skill_stats': '#FF9FF3'
      };

 console.log(data, "data inside show")
  const skills = data.transactions.map((t) => {
    return {
        name: t.type.replace('skill_', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()),
        value: t.amount,
        color: skillColors[t.type] || '#CCCCCC'
    }
  });
  createPieChart(skills);
}

if(localStorage.getItem('jwt')) {
//to do
const res = await fetchUser();
showDetails(res);

} else {
    window.location.href = "./index.html"
}


async function fetchUser() {
    const token = localStorage.getItem('jwt')

    if(!token) {
        throw new Error("User not authenticated")
    }
    try {
        const response = await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                query: `
                    query {
                        user {
                        login
                        auditRatio
                        totalUp
                        totalDown
                        audits_aggregate (
                            where:{grade:{_neq:0}}){
                            aggregate {
                                count
                            }
                        }
                        attrs
                        transactions(
                            order_by: [{ type: asc }, { amount: asc }]
                            distinct_on: [type]
                            where: { type: { _like: "skill_%" }}
                        )   { 
                            type
                            amount
                        }
                        xps(
                            where: { path: { _nregex: "piscine-(go|js)" } }
                            order_by: { amount: asc }
                        )   {
                            amount
                            path
                            }
                        progresses(
                            order_by: { createdAt: asc }
                            where: { path: { _nregex: "piscine-(go|js)" } }
                        )   {
                            createdAt
                            path
                            }
                        }
                    }
                `
            })
         })
         const data = await response.json()
         console.log("res", data)
         if (data && data.data && data.data.user && data.data.user.length > 0) {
            console.log("data.data", data.data)
            return data.data.user[0];
        } else {
            if (data?.errors?.[0]?.extensions?.code === "invalid-jwt") {
                window.location.href = "index.html"
                return;
            }
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return false;
    }
}

function createPieChart(skills) {
    console.log("!!Inside createPieChart")
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '300');
    svg.setAttribute('viewBox', '0 0 100 100');

    const skillCircle = document.getElementById('skillCircle');
    skillCircle.innerHTML = ''; // Clear previous content
    skillCircle.appendChild(svg);

    let startAngle = 0;
    const total = skills.reduce((sum, skill) => sum + skill.value, 0);


skills.forEach(skill => {
    const percentage = skill.value / total;
    const endAngle = startAngle + percentage * 360;

    // Create pie slice
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    path.setAttribute('d', `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', skill.color);
    svg.appendChild(path);

    // Add percentage text
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const textX = 50 + 35 * Math.cos(Math.PI * midAngle / 180);
    const textY = 50 + 35 * Math.sin(Math.PI * midAngle / 180);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '4');
    text.textContent = `${Math.round(percentage * 100)}%`;
    svg.appendChild(text);

    startAngle = endAngle;
});

const legend = document.createElement('div');
legend.style.marginTop = '20px';

legend.style.marginLeft = '40px';
legend.style.fontSize = '10px';
legend.style.overflow = 'auto';

skills.forEach(skill => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.marginBottom = '5px';

    const color = document.createElement('div');
    color.style.width = '50px';
    color.style.height = '20px';
    color.style.overflow = 'auto';
    color.style.backgroundColor = skill.color;
    color.style.marginRight = '10px';

    const text = document.createElement('span');
    text.style.whiteSpace = 'nowrap'; // Prevent text from wrapping
    text.style.overflow = 'auto'; // Hide overflow
    text.style.color = 'rgb(114, 117, 117)'; // Hide overflow
    text.style.fontWeight = 'bold'; // Hide overflow
    text.style.fontSize = "20px";
    text.textContent = skill.name;

    item.appendChild(color);
    item.appendChild(text);
    legend.appendChild(item);
});

skillCircle.appendChild(legend);
}

function createProjectChart(projectData) {
    const svg = document.getElementById('projectChart');
    const tooltip = document.getElementById('tooltip');
    svg.innerHTML = ''; // Clear previous content

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const containerWidth = svg.parentElement.clientWidth;
    // const width = containerWidth - margin.left - margin.right;
    const width = Math.max(projectData.length * 40, 500) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height + margin.top + margin.bottom);
    svg.style.overflow = 'auto';

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Set up scales
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(projectData.map(d => d.name));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(projectData, d => d.amount)])

    // Create bars
    projectData.forEach((d, i) => {
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('class', 'bar');
        bar.setAttribute('x', x(d.name));
        bar.setAttribute('width', x.bandwidth());
        bar.setAttribute('y', y(d.amount));
        bar.setAttribute('height', height - y(d.amount));

        bar.addEventListener('mouseover', (event) => {
            tooltip.style.opacity = 1;
            tooltip.innerHTML = `Project: ${d.name}<br>XP: ${d.amount} kb<br>Date: ${d.date.toLocaleDateString()}`;
            tooltip.style.left = `${event.pageX}px`;
            tooltip.style.top = `${event.pageY - 28}px`;
        });

        bar.addEventListener('mouseout', () => {
            tooltip.style.opacity = 0;
        });

        g.appendChild(bar);
    });

    // Add axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y)
    .tickFormat(d => `${d}`);

    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('transform', `translate(0,${height})`);
    d3.select(xAxisGroup).call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");
    g.appendChild(xAxisGroup);

    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    d3.select(yAxisGroup).call(yAxis);
    g.appendChild(yAxisGroup);

    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('class', 'axis-label');
    yLabel.setAttribute('transform', 'rotate(-90)');
    yLabel.setAttribute('x', -height / 2);
    yLabel.setAttribute('y', -margin.left + 20);
    yLabel.textContent = 'XP Amount';
    g.appendChild(yLabel);

    // Set the viewBox to enable responsive scaling
    const graphWidth = Math.max(width, projectData.length * 40);
    svg.setAttribute('viewBox', `0 0 ${graphWidth + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
}

document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
});


