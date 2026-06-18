    // Setup Scramble Generator
        const inv = (alg) => alg.replace(/[()]/g, '').split(' ').filter(m=>m).reverse().map(m => m.includes("'") ? m.replace("'", "") : (m.includes("2") ? m : m + "'")).join(' ');

        // COMPRESSION HELPERS: Dynamically map strings to 25-block matrices
        const pat = (s) => {
            const c = s.replace(/\s+/g, '').split('');
            return ['_',c[0],c[1],c[2],'_',c[3],c[4],c[5],c[6],c[7],c[8],c[9],c[10],c[11],c[12],c[13],c[14],c[15],c[16],c[17],'_',c[18],c[19],c[20],'_'];
        };

        // Generates an OLL pattern using only the 3x3 U-face string (0=gray, u=yellow)
        const ollPat = (t) => pat(`xxx x${t.slice(0,3)}x x${t.slice(3,6)}x x${t.slice(6,9)}x xxx`);
        
        const cmllPat = (tops, sides) => {
            let p = Array(25).fill('x');
            p[0] = p[4] = p[20] = p[24] = '_'; 
            p[6] = tops[0] ? 'u' : 'x'; p[8] = tops[1] ? 'u' : 'x'; 
            p[16] = tops[2] ? 'u' : 'x'; p[18] = tops[3] ? 'u' : 'x';
            p[1] = sides[0]; p[3] = sides[1]; p[5] = sides[2]; p[9] = sides[3]; p[15] = sides[4]; p[19] = sides[5]; p[21] = sides[6]; p[23] = sides[7]; 
            return p;
        };

        // --- COMPRESSED RAW DATABASE ---
        
        // PLL FORMAT: "id | Group & Name | Algorithm | PatternString"
        const rawPLLs = [
            // Edges Only
            "ua|Edges Only - Ua Perm|M2 U M U2 M' U M2|bbb luuur fuuul luuur frf",
            "ub|Edges Only - Ub Perm|M2 U' M U2 M' U' M2|bbb luuur ruuuf luuur flf",
            "h|Edges Only - H Perm|M2 U M2 U2 M2 U M2|bfb luuur ruuul luuur fbf",
            "z|Edges Only - Z Perm|M2 U M2 U M' U2 M2 U2 M'|brb luuur fuuub luuur flf",

            // Corners Only
            "aa|Corners Only - Aa Perm|x R' U R' D2 R U' R' D2 R2 x'|bbr luuub luuur fuuur lff",
            "ab|Corners Only - Ab Perm|x R2 D2 R U R' D2 R U' R x'|fbb buuur luuur luuuf ffl",
            "e|Corners Only - E Perm|x' R U' R' D R U R' D' R U R' D R U' R' D' x|fbf luuur luuur luuur bfb",

            // Adjacent Swap
            "t|Adjacent Swap - T Perm|R U R' U' R' F R2 U' R' U' R U R' F'|bbf luuur ruuul luuur ffb",
            "jb|Adjacent Swap - Jb Perm|R U R' F' R U R' U' R' F R2 U' R' U'|bbf luuur luuuf luuur frb",
            "ja|Adjacent Swap - Ja Perm|x R2 F R F' R U2 r' U r U2 x'|fbb luuur buuur luuur blf",
            "ra|Adjacent Swap - Ra Perm|R U R' F' R U2 R' U2 R' F R U R U2 R'|brf luuub luuur luuuf fbr",
            "rb|Adjacent Swap - Rb Perm|R' U2 R U2 R' F R U R' U' R' F' R2|flb buuur luuur fuuur lbf",
            "f|Adjacent Swap - F Perm|R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R|fbf luuur luuuf luuur brb",

            // Diagonal Swap
            "v|Diagonal Swap - V Perm|R' U R' d' R' F' R2 U' R' U R' F R F|blf luuub luuur fuuur rbf",
            "y|Diagonal Swap - Y Perm|F R U' R' U' R U R' F' R U R' U' R' F R F'|bbf luuul fuuur ruuur blf",
            "na|Diagonal Swap - Na Perm|R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'|ffb ruuul ruuul ruuul bbf",
            "nb|Diagonal Swap - Nb Perm|r' D' F r U' r' F' D r2 U r' U' r' F r F'|bff ruuul ruuul ruuul fbb",

            // G Perms 
            "ga|G Perm - Ga|R2 U R' U R' U' R U' R2 D U' R' U R D'|brb luuur buuul fuuur ffl",
            "gb|G Perm - Gb|F' U' F R2 u R' U R U' R u' R2|frb buuur luuuf luuur lbf",
            "gc|G Perm - Gc|R2 U' R U' R U R' U R2 D' U R U' R' D|blb luuur ruuub luuuf rff",
            "gd|G Perm - Gd|R U R' U' D R2 U' R U' R' U R' U R2 D'|flb luuuf buuur luuur fbr"
        ];

       // OLL FORMAT: "id | SpeedCubeDB Group & Name | Algorithm | 3x3 Top Yellow Pattern"
        const rawOLLs = [
            // Dot Cases
            "1|Dot Case (OLL 1)|R U2 R2 F R F' U2 R' F R F'|xxx xux xxx",
            "2|Dot Case (OLL 2)|F R U R' U' F' f R U R' U' f'|xxx xux xxx",
            "3|Dot Case (OLL 3)|f R U R' U' f' U' F R U R' U' F'|uux xux xux",
            "4|Dot Case (OLL 4)|f R U R' U' f' U F R U R' U' F'|xuu xux uxx",
            "17|Dot Case (OLL 17)|F R' F' R2 r' U R U' R' U' M'|uxx xux uxx",
            "18|Dot Case (OLL 18)|r U R' U R U2 r2 U' R U' R' U2 r|xxu xux uxx",
            "19|Dot Case (OLL 19)|r' R U R U R' U' M' R' F R F'|uxx xux xxu",
            "20|Dot Case (OLL 20)|r U R' U' M2 U R U' R' U' M'|uux xux uux",

            // Square Shapes
            "5|Square (OLL 5)|r' U2 R U R' U r|uux uux xxx",
            "6|Square (OLL 6)|r U2 R' U' R U' r'|xuu xuu xxx",

            // Lightning Shapes
            "7|Lightning (OLL 7)|r U R' U R U2 r'|xux uux uxx",
            "8|Lightning (OLL 8)|l' U' L U' L' U2 l|xux xuu xxu",
            "11|Lightning (OLL 11)|r' R2 U R' U R U2 R' U M'|xxu uux xux",
            "12|Lightning (OLL 12)|M R U R' U R U2 R' U M'|uxx xuu xux",
            "39|Lightning (OLL 39)|L F' L' U' L U F U' L'|uxx uux xux",
            "40|Lightning (OLL 40)|R' F R U R' U' F' U R|xux xuu uxx",

            // Fish Shapes
            "9|Fish (OLL 9)|R U R' U' R' F R2 U R' U' F'|uux uux xxu",
            "10|Fish (OLL 10)|R U R' U R' F R F' R U2 R'|xuu xuu uxx",
            "35|Fish (OLL 35)|R U2 R2 F R F' R U2 R'|uxx uux uux",
            "37|Fish (OLL 37)|F R' F' R U R U' R'|xxu xuu xuu",

            // Knight Move Shapes
            "13|Knight Move (OLL 13)|F U R U' R2 F' R U R U' R'|xxx uux uxx",
            "14|Knight Move (OLL 14)|R' F R U R' F' R y' R U' R'|xxx xuu xxu",
            "15|Knight Move (OLL 15)|l' U' l L' U' L U l' U l|uxx uux xxx",
            "16|Knight Move (OLL 16)|r U r' R U R' U' r U' r'|xxu xuu xxx",

            // OCLL (Cross)
            "21|OCLL - Pi (OLL 21)|R U2 R' U' R U R' U' R U' R'|xxx uuu xxx",
            "22|OCLL - Wheel (OLL 22)|R U2 R2 U' R2 U' R2 U2 R|xxx uuu xxx",
            "23|OCLL - Headlights (OLL 23)|R2 D R' U2 R D' R' U2 R'|xxx uuu xxx",
            "24|OCLL - Chameleon (OLL 24)|r U R' U' r' F R F'|uxx uuu uxx",
            "25|OCLL - Bowtie (OLL 25)|F' r U R' U' r' F R|uxx uuu xxu",
            "26|OCLL - Anti-Sune (OLL 26)|R U2 R' U' R U' R'|xxu uuu xxx",
            "27|OCLL - Sune (OLL 27)|R U R' U R U2 R'|uxx uuu xxx",

            // All Corners Oriented
            "28|All Corners (OLL 28)|r U R' U' r' R U R U' R'|uux xux uux",
            "57|All Corners (OLL 57)|R U R' U' M' U R U' r'|uxu xux uxu",

            // Awkward Shapes
            "29|Awkward (OLL 29)|R U R' U' R U' R' F' U' F R U R'|xux uuu uxx",
            "30|Awkward (OLL 30)|F R' F R2 U' R' U' R U R' F2|xux uuu xxu",
            "41|Awkward (OLL 41)|R U R' U R U2 R' F R U R' U' F'|uux uuu xxx",
            "42|Awkward (OLL 42)|R' U' R U' R' U2 R F R U R' U' F'|xuu uuu xxx",

            // P Shapes
            "31|P Shape (OLL 31)|R' U' F U R U' R' F' R|uxx uux xxx",
            "32|P Shape (OLL 32)|R U B' U' R' U R B R'|xxu xuu xxx",
            "43|P Shape (OLL 43)|F' U' L' U L F|xux uux xxx",
            "44|P Shape (OLL 44)|F U R U' R' F'|xux xuu xxx",

            // T Shapes
            "33|T Shape (OLL 33)|R U R' U' R' F R F'|xux uuu xux",
            "45|T Shape (OLL 45)|F R U R' U' F'|xxx uuu xux",

            // C Shapes
            "34|C Shape (OLL 34)|R U R2 U' R' F R U R U' F'|xux uux xux",
            "46|C Shape (OLL 46)|R' U' R' F R F' U R|xux xuu xux",

            // W Shapes
            "36|W Shape (OLL 36)|L' U' L U' L' U L U L F' L' F|uxx uux xxu",
            "38|W Shape (OLL 38)|R U R' U R U' R' U' R' F R F'|xxu xuu uxx",

            // L Shapes
            "47|L Shape (OLL 47)|R' U' R' F R F' R' F R F' U R|xux uux uxx",
            "48|L Shape (OLL 48)|F R U R' U' R U R' U' F'|xux xuu xxu",
            "49|L Shape (OLL 49)|r U' r2 U r2 U r2 U' r|xxu uux xxx",
            "50|L Shape (OLL 50)|r' U r2 U' r2 U' r2 U r'|uxx xuu xxx",
            "53|L Shape (OLL 53)|r' U' R U' R' U R U' R' U2 r|xux uux xxu",
            "54|L Shape (OLL 54)|r U R' U R U' R' U R U2 r'|xux xuu uxx",

            // Line Shapes
            "51|Line (OLL 51)|f R U R' U' R U R' U' f'|xxx uuu xxu",
            "52|Line (OLL 52)|R U R' U R U' B U' B' R'|xxx uuu uxx",
            "55|Line (OLL 55)|R' F R U R U' R2 F' R2 U' R' U R U R'|uuu uuu xxx",
            "56|Line (OLL 56)|r' U' r U' R' U R U' R' U R r' U r|xxx uuu uuu"
        ];

       // CMLL FORMAT: "id | Name | Alg | Top[4] | Sides[8]"
        const rawCMLLs = [
            // O Set (2 Cases)
            "o1|O Adjacent|R U R' F' R U R' U' R' F R2 U' R' U'|1,1,1,1|b,f,l,r,l,r,f,b",
            "o2|O Diagonal|F R U' R' U' R U R' F' R U R' U' R' F R F'|1,1,1,1|f,b,r,l,l,r,f,b",
            
            // H Set (4 Cases)
            "h1|H Columns|R U R' U R U' R' U R U2 R'|0,0,0,0|b,b,u,u,u,u,f,f",
            "h2|H Rows|F R U R' U' R U R' U' R U R' U' F'|0,0,0,0|u,u,l,r,l,r,u,u",
            "h3|H Column|U R U2 R2 F R F' U2 R' F R F'|0,0,0,0|u,u,l,r,u,u,f,f",
            "h4|H Row|U2 r U' r2 D' r U' r' D r2 U r'|0,0,0,0|b,b,u,u,l,r,u,u",

            // Pi Set (6 Cases)
            "pi1|Pi Right Bar|F R U R' U' R U R' U' F'|1,1,0,0|b,b,l,r,u,u,f,f",
            "pi2|Pi Down Slash|U F R' F' R U2 R U' R' U R U2 R'|1,1,0,0|f,b,r,l,u,u,f,b",
            "pi3|Pi X|U' R' F R U F U' R U R' U' F'|1,1,0,0|f,f,l,r,u,u,b,b",
            "pi4|Pi Up Slash|R U2 R' U' R U R' U2 R' F R F'|1,1,0,0|b,f,l,r,u,u,b,f",
            "pi5|Pi Columns|U' r U' r2 D' r U r' D r2 U r'|1,1,0,0|f,f,r,l,u,u,b,b",
            "pi6|Pi Left Bar|R' F' U' F U' R U R' U R|1,1,0,0|b,b,r,l,u,u,f,f",

            // U Set (6 Cases)
            "u1|U Up Slash|R2 D R' U2 R D' R' U2 R'|1,1,0,0|b,b,l,r,l,r,u,u",
            "u2|U Down Slash|R2 D' R U2 R' D R U2 R|1,1,0,0|f,f,l,r,l,r,u,u",
            "u3|U Bottom Row|R' U' R U' R' U2 R2 U R' U R U2 R'|1,1,0,0|b,f,r,l,l,r,u,u",
            "u4|U Rows|F U R2 D R' U' R D' R2 F'|1,1,0,0|f,b,l,r,l,r,u,u",
            "u5|U X|U2 r U' r' U r' D' r U' r' D r|1,1,0,0|b,f,l,r,l,r,u,u",
            "u6|U Upper Row|R2 F U' F U F2 R2 U' R' F R|1,1,0,0|f,b,r,l,l,r,u,u",

            // T Set (6 Cases)
            "t1|T Left Bar|R U R' U' R' F R F'|1,0,1,0|b,u,l,r,l,u,f,f",
            "t2|T Right Bar|L' U' L U L F' L' F|1,0,1,0|f,u,l,r,l,u,b,b",
            "t3|T Rows|F R U R' U' R U' R' U' R U R' F'|1,0,1,0|f,u,r,l,l,u,f,b",
            "t4|T Bottom Row|r' D' r U r' D r U' r U r'|1,0,1,0|f,u,l,r,l,u,b,f",
            "t5|T Top Row|R' U r U2 r' U' r U' r' U2 R|1,0,1,0|b,u,l,l,r,u,b,f",
            "t6|T Columns|r U' r' U' r U r' F' U M'|1,0,1,0|f,u,r,l,l,u,f,f",

            // L Set (6 Cases)
            "l1|L Best|F R' F' R U R U' R'|1,0,0,1|b,u,l,r,u,r,f,b",
            "l2|L Good|F R U R' U' R U R' U' F'|1,0,0,1|f,u,l,r,u,r,b,f",
            "l3|L Pure|R U2 R' U' R U R' U' R U R' U' R U' R'|1,0,0,1|f,u,r,l,u,l,f,f",
            "l4|L Front Comm|R U2 R' U' R U' R' F R' F' R|1,0,0,1|f,u,r,l,u,l,b,f",
            "l5|L Diagonal|R U R' U R U' R' U' R' F R F'|1,0,0,1|b,u,l,r,u,r,f,f",
            "l6|L Back Comm|R' U' R U R' F' R U R' U' R' F R2|1,0,0,1|b,u,l,r,u,r,b,f",

            // Sune Set (6 Cases)
            "s1|Sune Left Bar|R U R' U R U2 R'|1,0,0,0|b,u,l,r,u,u,f,f",
            "s2|Sune X|L' U R U' L U R'|1,0,0,0|f,u,l,r,u,u,b,b",
            "s3|Sune Up Slash|R U2 R' U2 R' F R F'|1,0,0,0|f,u,r,l,u,u,f,b",
            "s4|Sune Columns|R U' R' U2 R U' R' U2 R' D' R U R' D R|1,0,0,0|f,u,l,r,u,u,b,f",
            "s5|Sune Right Bar|R U R' U R' F R F' R U2 R'|1,0,0,0|b,u,r,l,u,u,f,b",
            "s6|Sune Down Slash|R U R' U R U' R' U R U2 R'|1,0,0,0|b,u,l,r,u,u,b,f",

            // Anti-Sune Set (6 Cases)
            "as1|Anti-Sune Right Bar|R U2 R' U' R U' R'|0,0,0,1|b,b,u,u,l,r,f,u",
            "as2|Anti-Sune Columns|R' U' R U' R F' R' F R' U2 R|0,0,0,1|f,f,u,u,l,r,b,u",
            "as3|Anti-Sune Down Slash|R U' L' U R' U' L|0,0,0,1|f,b,u,u,r,l,f,u",
            "as4|Anti-Sune X|R' U2 R U2 R F' R' F|0,0,0,1|f,b,u,u,l,r,b,u",
            "as5|Anti-Sune Up Slash|R' U' R U' R' U R U' R' U2 R|0,0,0,1|b,f,u,u,r,l,f,u",
            "as6|Anti-Sune Left Bar|R' U R U2 R' U R U2 R D R' U' R D' R'|0,0,0,1|b,f,u,u,l,r,b,u"
        ];

        // Hydrate the Main Database
        const database = [
            { id: "custom_xky", category: "Custom", name: "xky perm", setup: "L' U R U' L' U2 R' U R U2 R'", alg: "(R U2 R' U') (R U2) (L U R' U' L)", pattern: pat("bbb luuur luuur luuur fff") },
            
            // Hydrate PLLs
            ...rawPLLs.map(s => {
                const [id, name, alg, pStr] = s.split('|');
                return { id: `pll_${id}`, category: "PLL", name, alg, setup: inv(alg), pattern: pat(pStr) };
            }),

            // Hydrate OLLs
            ...rawOLLs.map(s => {
                const [id, name, alg, pStr] = s.split('|');
                return { id: `oll_${id}`, category: "OLL", name: name, alg, setup: inv(alg), pattern: ollPat(pStr) };
            }),

            // Hydrate CMLLs (Sample set included for brevity, using their visual parser)
            ...rawCMLLs.map(s => {
                const [id, name, alg, tops, sides] = s.split('|');
                return { id: `cmll_${id}`, category: "CMLL", name, alg, setup: inv(alg), pattern: cmllPat(tops.split(',').map(Number), sides.split(',')) };
            })
        ];

        class RepertoireApp {
            constructor() {
                this.favorites = JSON.parse(localStorage.getItem('cube_favorites') || '[]');
                this.currentFilter = 'all';
                this.trainingPool = [];
                this.trainState = 'scrambling'; // 'scrambling', 'ready', 'timing', 'revealed'
                this.timerInterval = null;
                this.startTime = 0;
                
                this.setupKeyboard();
                this.renderLibrary('all');
            }

            toggleFavorite(id) {
                if (this.favorites.includes(id)) { this.favorites = this.favorites.filter(f => f !== id); } 
                else { this.favorites.push(id); }
                localStorage.setItem('cube_favorites', JSON.stringify(this.favorites));
                const btn = document.getElementById(`fav-btn-${id}`);
                if (btn) {
                    btn.innerHTML = this.favorites.includes(id) ? '★' : '☆';
                    btn.classList.toggle('active', this.favorites.includes(id));
                }
            }

            createCubeHTML(pattern) {
                const colors = { 'u':'var(--c-u)', 'f':'var(--c-f)', 'r':'var(--c-r)', 'b':'var(--c-b)', 'l':'var(--c-l)', 'x':'var(--c-x)' };
                let html = '<div class="cube-visualizer">';
                pattern.forEach(char => {
                    html += char === '_' ? '<div class="sticker hidden"></div>' : `<div class="sticker" style="background-color: ${colors[char] || colors['x']}"></div>`;
                });
                return html + '</div>';
            }

            renderLibrary(filter) {
                this.currentFilter = filter;
                document.querySelectorAll('.nav-buttons button:not(.primary)').forEach(b => b.classList.remove('active-filter'));
                document.getElementById(`nav-${filter.toLowerCase()}`)?.classList.add('active-filter');

                document.getElementById('library-view').style.display = 'grid';
                document.getElementById('trainer-view').style.display = 'none';

                const container = document.getElementById('library-view');
                container.innerHTML = '';

                let pool = database;
                if (filter === 'favorites') {
                    pool = database.filter(a => this.favorites.includes(a.id));
                    if (!pool.length) return container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px; color: var(--text-muted); border: 2px dashed var(--surface-alt); border-radius: 12px;">No favorites yet. Click the star icon to add algorithms here.</div>';
                } else if (filter !== 'all') {
                    pool = pool.filter(a => a.category === filter);
                }

                pool.forEach(alg => {
                    const isFav = this.favorites.includes(alg.id);
                    container.innerHTML += `
                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">${alg.name}</span>
                                <button id="fav-btn-${alg.id}" class="fav-btn ${isFav ? 'active' : ''}" onclick="app.toggleFavorite('${alg.id}')">${isFav ? '★' : '☆'}</button>
                            </div>
                            <div class="card-category">${alg.category}</div>
                            ${this.createCubeHTML(alg.pattern)}
                            <div class="alg-text">${alg.alg}</div>
                            <button class="train-btn" onclick="app.startTraining('${alg.id}')">Drill This Case</button>
                        </div>
                    `;
                });
            }

            startTraining(mode) {
                this.trainingPool = mode === 'current' 
                    ? (this.currentFilter === 'all' ? database : database.filter(a => this.currentFilter === 'favorites' ? this.favorites.includes(a.id) : a.category === this.currentFilter))
                    : database.filter(a => a.id === mode);

                if (!this.trainingPool.length) return alert("No algorithms found!");
                
                document.getElementById('library-view').style.display = 'none';
                document.getElementById('trainer-view').style.display = 'flex';
                this.nextCard();
            }

            exitTraining() {
                clearInterval(this.timerInterval);
                document.getElementById('trainer-view').style.display = 'none';
                document.getElementById('library-view').style.display = 'grid';
            }

            nextCard() {
                this.trainState = 'scrambling';
                document.getElementById('timer-display').innerText = "0.00";
                document.getElementById('timer-display').classList.remove('running');
                
                const badge = document.getElementById('trainer-status');
                badge.innerText = "Apply Scramble (Press Space when done)";
                badge.className = "status-badge normal";
                
                this.currentAlg = this.trainingPool[Math.floor(Math.random() * this.trainingPool.length)];
                
                document.getElementById('trainer-name').innerText = this.currentAlg.name;
                document.getElementById('trainer-category').innerText = this.currentAlg.category;
                document.getElementById('trainer-scramble').innerText = this.currentAlg.setup;
                document.getElementById('trainer-cube-container').innerHTML = this.createCubeHTML(this.currentAlg.pattern);
                
                const notEl = document.getElementById('trainer-notation');
                notEl.innerText = this.currentAlg.alg;
                notEl.style.visibility = 'hidden';
            }

            setupKeyboard() {
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space' && document.getElementById('trainer-view').style.display === 'flex') {
                        e.preventDefault();
                        if (this.trainState === 'scrambling') {
                            this.trainState = 'ready';
                            const badge = document.getElementById('trainer-status');
                            badge.innerText = "READY! (Press Space to begin)";
                            badge.className = "status-badge ready";
                        } 
                        else if (this.trainState === 'ready') {
                            this.trainState = 'timing';
                            document.getElementById('trainer-status').innerText = "Solving...";
                            document.getElementById('trainer-status').className = "status-badge normal";
                            document.getElementById('timer-display').classList.add('running');
                            this.startTime = Date.now();
                            this.timerInterval = setInterval(() => {
                                document.getElementById('timer-display').innerText = ((Date.now() - this.startTime) / 1000).toFixed(2);
                            }, 10);
                        } 
                        else if (this.trainState === 'timing') {
                            this.trainState = 'revealed';
                            clearInterval(this.timerInterval);
                            document.getElementById('timer-display').classList.remove('running');
                            document.getElementById('trainer-status').innerText = "Check Notation (Press Space for next)";
                            document.getElementById('trainer-notation').style.visibility = 'visible';
                        } 
                        else if (this.trainState === 'revealed') {
                            this.nextCard();
                        }
                    }
                });
            }
        }

        const app = new RepertoireApp();