let scene, camera, renderer, playerObject, computerObject, particles = [];
let playerScore = 0, computerScore = 0;
const textureLoader = new THREE.TextureLoader();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    playerObject = createNeutralObject();
    computerObject = createNeutralObject();
    playerObject.position.x = -2;
    computerObject.position.x = 2;
    scene.add(playerObject);
    scene.add(computerObject);

    createStarfield();

    animate();
    
    // Adjust object positions based on screen size
    adjustObjectPositions();
}

function adjustObjectPositions() {
    const width = window.innerWidth;
    if (width <= 600) {
        playerObject.position.x = -1.5;
        computerObject.position.x = 1.5;
        camera.position.z = 6;
    } else if (width <= 1024) {
        playerObject.position.x = -1.8;
        computerObject.position.x = 1.8;
        camera.position.z = 5.5;
    } else {
        playerObject.position.x = -2;
        computerObject.position.x = 2;
        camera.position.z = 5;
    }
}

function createNeutralObject() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc,
        specular: 0x555555,
        shininess: 30
    });
    return new THREE.Mesh(geometry, material);
}

function createRockObject() {
    const geometry = new THREE.DodecahedronGeometry(1, 1);
    const texture = textureLoader.load('https://i.imgur.com/EqKMrKY.jpg');
    const material = new THREE.MeshPhongMaterial({ 
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
        specular: 0x555555,
        shininess: 30
    });
    return new THREE.Mesh(geometry, material);
}

function createPaperObject() {
    const geometry = new THREE.PlaneGeometry(1.5, 2);
    const texture = textureLoader.load('https://i.imgur.com/Oc1UXQM.jpg');
    const material = new THREE.MeshPhongMaterial({ 
        map: texture,
        bumpMap: texture,
        bumpScale: 0.01,
        side: THREE.DoubleSide,
        specular: 0x555555,
        shininess: 30
    });
    return new THREE.Mesh(geometry, material);
}

function createScissorsObject() {
    const group = new THREE.Group();

    const bladeGeometry = new THREE.ConeGeometry(0.1, 1, 32);
    const bladeTexture = textureLoader.load('https://i.imgur.com/XvAiMNX.jpg');
    const bladeMaterial = new THREE.MeshPhongMaterial({ 
        map: bladeTexture,
        bumpMap: bladeTexture,
        bumpScale: 0.02,
        specular: 0x555555,
        shininess: 30
    });

    const blade1 = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade1.position.set(0.1, 0.5, 0);
    blade1.rotation.z = Math.PI / 6;

    const blade2 = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade2.position.set(-0.1, 0.5, 0);
    blade2.rotation.z = -Math.PI / 6;

    group.add(blade1);
    group.add(blade2);

    return group;
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 10000; i++) {
        vertices.push(
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function animate() {
    requestAnimationFrame(animate);
    playerObject.rotation.y += 0.01;
    computerObject.rotation.y += 0.01;
    animateParticles();
    renderer.render(scene, camera);
}

function updateObject(object, choice) {
    scene.remove(object);
    switch(choice) {
        case 'rock':
            object = createRockObject();
            break;
        case 'paper':
            object = createPaperObject();
            break;
        case 'scissors':
            object = createScissorsObject();
            break;
    }
    object.position.x = object === playerObject ? playerObject.position.x : computerObject.position.x;
    scene.add(object);
    return object;
}

function playGame(playerChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    gsap.to(camera.position, { duration: 1, z: camera.position.z + 3, ease: "power2.inOut" });

    setTimeout(() => {
        playerObject = updateObject(playerObject, playerChoice);
        computerObject = updateObject(computerObject, computerChoice);

        gsap.to(camera.position, { duration: 1, z: camera.position.z - 3, ease: "power2.inOut" });

        let result;
        if (playerChoice === computerChoice) {
            result = "It's a tie!";
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = "You win!";
            playerScore++;
            createParticles(playerObject.position, 0x00ff00);
        } else {
            result = "Computer wins!";
            computerScore++;
            createParticles(computerObject.position, 0xff0000);
        }

        document.getElementById('result').textContent = `You chose ${playerChoice}. Computer chose ${computerChoice}. ${result}`;
        document.getElementById('playerScore').textContent = playerScore;
        document.getElementById('computerScore').textContent = computerScore;
    }, 1000);
}

function createParticles(position, color) {
    for (let i = 0; i < 100; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 8, 8),
            new THREE.MeshBasicMaterial({ color: color })
        );
        particle.position.set(position.x, position.y, position.z);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        scene.add(particle);
        particles.push(particle);
    }
}

function animateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].position.add(particles[i].velocity);
        particles[i].material.opacity -= 0.02;
        if (particles[i].material.opacity <= 0) {
            scene.remove(particles[i]);
            particles.splice(i, 1);
        }
    }
}

init();

document.getElementById('rock').addEventListener('click', () => playGame('rock'));
document.getElementById('paper').addEventListener('click', () => playGame('paper'));
document.getElementById('scissors').addEventListener('click', () => playGame('scissors'));

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustObjectPositions();
});
