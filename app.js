// Basic Three.js interactive scene with clickable parts
(function(){
  const container = document.getElementById('viewer');
  const width = container.clientWidth || 800;
  const height = Math.max(360, container.clientHeight || 480);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071224);

  const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 2000);
  camera.position.set(2.5, 1.6, 3.5);

  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5,10,7);
  scene.add(dir);

  // Add a simple "model" made of parts you can click
  const parts = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({color:0x7cc6ff,metalness:0.3,roughness:0.4});
  const part1 = new THREE.Mesh(new THREE.BoxGeometry(1.2,0.3,0.8), baseMat.clone());
  part1.position.set(0,0.1,0);
  part1.name = 'Base';
  part1.userData.info = 'Base: foundation of the device.';

  const part2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.9,32), baseMat.clone());
  part2.position.set(-0.6,0.8,0);
  part2.name = 'Arm';
  part2.userData.info = 'Arm: moves to perform action.';

  const part3 = new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32), baseMat.clone());
  part3.position.set(0.7,0.6,0.2);
  part3.name = 'Sensor';
  part3.userData.info = 'Sensor: captures environmental data.';

  parts.add(part1, part2, part3);
  scene.add(parts);

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshStandardMaterial({color:0x031326,roughness:1}));
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -0.01;
  scene.add(ground);

  // Raycaster for interactions
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;

  function onPointerMove(e){
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left)/rect.width)*2-1;
    pointer.y = -((e.clientY - rect.top)/rect.height)*2+1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(parts.children, false);
    if(intersects.length){
      document.body.style.cursor = 'pointer';
      if(hovered !== intersects[0].object){
        if(hovered) hovered.scale.setScalar(1);
        hovered = intersects[0].object;
        hovered.scale.setScalar(1.06);
      }
    } else {
      document.body.style.cursor = '';
      if(hovered) hovered.scale.setScalar(1);
      hovered = null;
    }
  }

  function onClick(e){
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left)/rect.width)*2-1;
    pointer.y = -((e.clientY - rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(parts.children, false);
    if(intersects.length){
      const obj = intersects[0].object;
      showInfo(obj.name, obj.userData.info);
    }
  }

  function showInfo(title, text){
    const overlay = document.getElementById('infoOverlay');
    overlay.innerHTML = `<strong>${title}</strong><div style="margin-top:6px;font-size:0.95rem;opacity:0.95">${text}</div>`;
    overlay.classList.remove('hidden');
    clearTimeout(overlay._hideTimeout);
    overlay._hideTimeout = setTimeout(()=>overlay.classList.add('hidden'), 6000);
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onClick);

  // Reset view
  document.getElementById('resetView').addEventListener('click', ()=>{
    camera.position.set(2.5,1.6,3.5);
    controls.target.set(0,0.4,0);
  });

  function onResize(){
    const w = container.clientWidth;
    const h = Math.max(360, container.clientHeight || 480);
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  window.addEventListener('resize', onResize);

  function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

})();
