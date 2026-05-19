// ========== Equipment Data (2025-2026 實際市場行情) ==========
// 全新價格來源：蝦皮、PChome、餐飲設備商官網
// 二手價格來源：露天拍賣、蝦皮二手、Facebook二手社團、二手餐飲設備行
const EQUIPMENT_DATA = [
    { name:'封口機', spec:'益芳 ET-95SN 全自動微電腦 (90/95mm通用)', newPrice:18000, usedPrice:8000, qty:1, category:'核心設備',
      newSource:'益芳官網/全洋餐飲設備', usedSource:'蝦皮二手/露天拍賣 搜尋「益芳封口機 二手」' },
    { name:'果糖機', spec:'益芳 16鍵全自動定量果糖機 110V', newPrice:12000, usedPrice:5000, qty:1, category:'核心設備',
      newSource:'蝦皮/PChome 搜尋「16鍵果糖機」', usedSource:'蝦皮二手 搜尋「果糖機 二手」約$3,000-$6,000' },
    { name:'搖搖機(雪克機)', spec:'元揚 自動搖茶機 YY-28 110V', newPrice:32000, usedPrice:14000, qty:1, category:'核心設備',
      newSource:'元揚官網/餐飲設備行', usedSource:'露天拍賣 搜尋「搖茶機 二手」' },
    { name:'製冰機', spec:'力頓 LD-220 日產200磅 氣冷式', newPrice:63000, usedPrice:28000, qty:1, category:'核心設備',
      newSource:'蝦皮/力頓經銷商 $60,000-$66,000', usedSource:'露天/蝦皮二手 $25,000-$45,000 視機齡' },
    { name:'開水機', spec:'偉志 10L自動進水加熱開水機', newPrice:9000, usedPrice:3500, qty:1, category:'核心設備',
      newSource:'蝦皮/PChome', usedSource:'二手餐飲設備行' },
    { name:'茶桶', spec:'不鏽鋼保溫茶桶 12L (304不鏽鋼)', newPrice:1800, usedPrice:800, qty:4, category:'核心設備',
      newSource:'蝦皮/批發市場', usedSource:'蝦皮二手' },
    { name:'冷藏冰箱', spec:'瑞興 RS-R1002 營業用400L雙門', newPrice:25000, usedPrice:10000, qty:1, category:'冷藏設備',
      newSource:'瑞興官網/餐飲設備行', usedSource:'Facebook「二手餐飲設備買賣」社團' },
    { name:'冷凍櫃', spec:'瑞興 300L上掀式冷凍櫃', newPrice:15000, usedPrice:6000, qty:1, category:'冷藏設備',
      newSource:'瑞興/蝦皮', usedSource:'二手設備行/露天' },
    { name:'工作檯冰箱', spec:'5尺全藏不鏽鋼工作台冰箱', newPrice:32000, usedPrice:13000, qty:1, category:'冷藏設備',
      newSource:'餐飲設備行', usedSource:'二手餐飲設備行 $10,000-$15,000' },
    { name:'煮珍珠爐', spec:'瓦斯快速爐+不鏽鋼大鍋(36cm)', newPrice:3500, usedPrice:1500, qty:1, category:'烹煮設備',
      newSource:'五金行/蝦皮', usedSource:'蝦皮二手' },
    { name:'電磁爐', spec:'營業用3500W電磁爐', newPrice:6500, usedPrice:2500, qty:1, category:'烹煮設備',
      newSource:'PChome/蝦皮', usedSource:'蝦皮二手' },
    { name:'淨水器', spec:'3M/賀眾 RO逆滲透+UV殺菌 商用型', newPrice:22000, usedPrice:10000, qty:1, category:'水處理',
      newSource:'3M官方授權經銷/蝦皮', usedSource:'較少二手，建議買全新(衛生考量)' },
    { name:'軟水器', spec:'全自動再生軟水系統 2噸/時', newPrice:12000, usedPrice:5000, qty:1, category:'水處理',
      newSource:'蝦皮/水處理設備商', usedSource:'蝦皮二手/水電行' },
    { name:'POS收銀系統', spec:'iCHEF/肚肚 含平板+出單機+錢箱', newPrice:30000, usedPrice:15000, qty:1, category:'收銀系統',
      newSource:'iCHEF月租方案$2,688/月 或 肚肚一次購$28,000起', usedSource:'蝦皮「POS機 二手」' },
    { name:'電子秤', spec:'AND 精準度0.1g 防水廚房秤', newPrice:1200, usedPrice:500, qty:1, category:'小型工具',
      newSource:'蝦皮/PChome', usedSource:'蝦皮二手' },
    { name:'量杯組', spec:'不鏽鋼量杯 700cc ×5入', newPrice:900, usedPrice:400, qty:1, category:'小型工具',
      newSource:'蝦皮/烘焙材料行', usedSource:'蝦皮二手' },
    { name:'雪克杯', spec:'304不鏽鋼雪克杯 700cc', newPrice:280, usedPrice:120, qty:4, category:'小型工具',
      newSource:'蝦皮 $250-$350/個', usedSource:'蝦皮二手' },
    { name:'果汁機', spec:'小太陽 TM-788 商用冰沙調理機 2L', newPrice:8500, usedPrice:3500, qty:1, category:'調理設備',
      newSource:'蝦皮/PChome', usedSource:'蝦皮二手 搜尋「商用果汁機 二手」' },
    { name:'奶蓋機', spec:'電動奶泡/奶蓋打發機 商用型', newPrice:4500, usedPrice:1800, qty:1, category:'調理設備',
      newSource:'蝦皮 $3,500-$5,500', usedSource:'蝦皮二手' },
    { name:'保溫桶', spec:'不鏽鋼大容量保溫桶 30L', newPrice:2800, usedPrice:1200, qty:2, category:'小型工具',
      newSource:'蝦皮/批發市場', usedSource:'蝦皮二手' },
    { name:'水槽', spec:'不鏽鋼三槽洗滌槽(衛生局規定)', newPrice:10000, usedPrice:4000, qty:1, category:'衛生設備',
      newSource:'不鏽鋼廚具行', usedSource:'二手餐飲設備行' },
    { name:'層架', spec:'304不鏽鋼四層置物架 120cm', newPrice:3000, usedPrice:1200, qty:2, category:'小型工具',
      newSource:'蝦皮/IKEA/特力屋', usedSource:'蝦皮二手/FB社團' },
    { name:'外送保溫袋', spec:'大容量保溫外送袋 加厚款', newPrice:600, usedPrice:200, qty:3, category:'外送設備',
      newSource:'蝦皮 $500-$800', usedSource:'蝦皮二手' },
    { name:'監視器系統', spec:'4路NVR+2支200萬畫素網路攝影機', newPrice:8000, usedPrice:3500, qty:1, category:'安全設備',
      newSource:'蝦皮/PChome/光華商場', usedSource:'蝦皮二手' },
];

// ========== Franchise Data (2025-2026 市場資訊) ==========
// 注意：加盟金額多為估算區間，實際金額需洽各品牌總部確認
// 部分品牌已暫停加盟或限定區域
const FRANCHISE_DATA = [
    {
        name:'50嵐', icon:'🟢',
        fee:'暫停加盟', deposit:'--', royalty:'約營收3%', adFund:'約營收1%',
        totalEst:'250-350萬(歷史資料)', note:'⚠️ 目前暫停台灣本地加盟，需內部員工/店長資歷',
        feeNum:0, depositNum:0, royaltyPct:3, adPct:1, status:'closed'
    },
    {
        name:'清心福全', icon:'💛',
        fee:'約80-120萬', deposit:'約20-30萬', royalty:'約營收3%', adFund:'約營收1%',
        totalEst:'300-400萬', note:'⚠️ 台中(含)以北目前暫停開放加盟',
        feeNum:1000000, depositNum:250000, royaltyPct:3, adPct:1, status:'limited'
    },
    {
        name:'CoCo都可', icon:'🟤',
        fee:'約30-60萬', deposit:'約30萬', royalty:'約營收5%', adFund:'約營收2%',
        totalEst:'250-400萬', note:'已開放單店加盟，建議直接聯繫總部',
        feeNum:450000, depositNum:300000, royaltyPct:5, adPct:2, status:'open'
    },
    {
        name:'鮮茶道', icon:'🍵',
        fee:'約50-80萬', deposit:'約15-20萬', royalty:'約營收2%', adFund:'約5,000/月',
        totalEst:'180-280萬', note:'有自有茶廠，原物料品質穩定',
        feeNum:650000, depositNum:175000, royaltyPct:2, adPct:0, status:'open'
    },
    {
        name:'迷客夏', icon:'🥛',
        fee:'約150萬', deposit:'約50萬', royalty:'約營收4%', adFund:'約營收1%',
        totalEst:'300-500萬', note:'主打鮮乳系列，品牌力強，需經審核面談',
        feeNum:1500000, depositNum:500000, royaltyPct:4, adPct:1, status:'open'
    },
    {
        name:'大苑子', icon:'🍊',
        fee:'約30萬', deposit:'約30萬', royalty:'約營收3%', adFund:'約營收1%',
        totalEst:'250-400萬', note:'鮮果茶定位，須專職經營+嚴格受訓',
        feeNum:300000, depositNum:300000, royaltyPct:3, adPct:1, status:'open'
    },
    {
        name:'茶湯會', icon:'🍃',
        fee:'約80-100萬', deposit:'約25-30萬', royalty:'約營收3%', adFund:'約營收1%',
        totalEst:'300-400萬', note:'春水堂副品牌，需參與說明會+完整考核',
        feeNum:900000, depositNum:275000, royaltyPct:3, adPct:1, status:'open'
    },
    {
        name:'北投紅茶', icon:'🔴',
        fee:'非連鎖加盟', deposit:'--', royalty:'--', adFund:'--',
        totalEst:'自行開店約120-200萬', note:'⚠️ 北投紅茶多為在地直營老店(如高記茶莊)，無公開加盟體系。若想做類似古早味紅茶，建議自創品牌',
        feeNum:0, depositNum:0, royaltyPct:0, adPct:0, status:'not-franchise'
    },
    {
        name:'古早味紅茶冰(攤車)', icon:'🧊',
        fee:'約15-20萬', deposit:'約5萬', royalty:'無', adFund:'無',
        totalEst:'30-60萬', note:'如寶島紅茶冰、十丈波等，包含設備+技術轉移，適合小額創業',
        feeNum:175000, depositNum:50000, royaltyPct:0, adPct:0, status:'open'
    },
    {
        name:'自創品牌', icon:'⭐',
        fee:'$0', deposit:'$0', royalty:'無', adFund:'自行決定',
        totalEst:'120-200萬', note:'自由度最高，需自建供應鏈與品牌，但無權利金負擔',
        feeNum:0, depositNum:0, royaltyPct:0, adPct:0, status:'open'
    },
];

// ========== 原物料供應商名單 (新北/台北地區，可實地走訪) ==========
const SUPPLIERS_DATA = [
    {
        category: '茶葉 / 飲品原料 / 包材（一站式）',
        suppliers: [
            { name:'上統食品', address:'新北市中和區建六路55號', phone:'02-2226-XXXX', note:'距離中和最近，茶葉/珍珠/果糖/包材/設備/開店教學', mapUrl:'https://maps.google.com/?q=新北市中和區建六路55號' },
            { name:'綺豐茶業', address:'新北市中和區忠孝街（近景安站）', phone:'02-2940-XXXX', note:'茶葉/飲料原料/包材/封口機/開店輔導', mapUrl:'https://maps.google.com/?q=新北市中和區忠孝街' },
            { name:'華宏國際物料', address:'新北市樹林區中正路218-4號', phone:'02-2908-9994', note:'大型原料商，茶葉/珍珠/果糖/OEM/ODM', mapUrl:'https://maps.google.com/?q=新北市樹林區中正路218-4號' },
            { name:'六六食品', address:'新北市永和區仁愛路61號', phone:'02-2926-XXXX', note:'泡沫紅茶/冰品原料批發，離中和很近', mapUrl:'https://maps.google.com/?q=新北市永和區仁愛路61號' },
            { name:'寶來食品原料', address:'新北市土城區中央路二段390巷3號', phone:'02-2260-XXXX', note:'飲品原料/開店諮詢', mapUrl:'https://maps.google.com/?q=新北市土城區中央路二段390巷3號' },
        ]
    },
    {
        category: '茶葉專門批發',
        suppliers: [
            { name:'鑫冠茶葉', address:'新北市（可宅配全台）', phone:'洽官網', note:'商用茶葉研發/客製風味設計', mapUrl:'' },
            { name:'桔揚 Good Young', address:'台北市（可宅配）', phone:'洽官網', note:'咖啡/茶葉批發/OEM/ODM', mapUrl:'' },
            { name:'御典天之茶', address:'全台宅配', phone:'洽官網', note:'飲料店/餐廳專用茶葉/免濾茶包', mapUrl:'' },
        ]
    },
    {
        category: '杯子 / 封膜 / 包材',
        suppliers: [
            { name:'彩虹杯坊', address:'新北市中和區中正路（可洽詢）', phone:'洽蝦皮/官網', note:'客製杯/公版杯/封膜，中和在地', mapUrl:'' },
            { name:'封王企業', address:'台北市/新北市（工廠直營）', phone:'洽官網', note:'封口膜專業廠商，可客製印刷', mapUrl:'' },
            { name:'蝦皮/露天搜尋', address:'線上平台', phone:'--', note:'搜尋「飲料杯 700cc 批發」「封膜 90mm」比價', mapUrl:'https://shopee.tw' },
        ]
    },
    {
        category: '設備 / 二手設備',
        suppliers: [
            { name:'全洋餐飲設備', address:'新北市板橋區（可到場看機）', phone:'洽官網', note:'全新設備/維修/保固', mapUrl:'' },
            { name:'二手餐飲設備社團', address:'Facebook搜尋', phone:'--', note:'搜尋「二手餐飲設備買賣」社團，常有頂讓', mapUrl:'https://facebook.com' },
            { name:'露天拍賣/蝦皮', address:'線上平台', phone:'--', note:'搜尋「二手 封口機」「二手 製冰機」比價', mapUrl:'https://ruten.com.tw' },
        ]
    },
    {
        category: '珍珠 / 配料專門',
        suppliers: [
            { name:'日出珍珠（配合上統/華宏等大盤）', address:'批發商配送', phone:'--', note:'黑糖珍珠/白珍珠/寒天/椰果等', mapUrl:'' },
            { name:'環南市場/濱江市場', address:'台北市萬華區/中山區', phone:'--', note:'各式食材批發市場，可比價', mapUrl:'https://maps.google.com/?q=環南市場' },
        ]
    },
];

// ========== 中和區域店租參考 (2025-2026 行情) ==========
const ZHONGHE_RENT_DATA = [
    { area:'景安捷運站周邊', range:'10-15坪', rentLow:35000, rentHigh:55000, note:'人流大，適合外帶飲料店，競爭激烈' },
    { area:'南勢角站/興南夜市', range:'10-15坪', rentLow:30000, rentHigh:50000, note:'夜市人流多，但黃金地段釋出稀少' },
    { area:'中和區中正路沿線', range:'10-15坪', rentLow:25000, rentHigh:40000, note:'主幹道，車流人流兼具' },
    { area:'中和區連城路/景平路', range:'10-15坪', rentLow:28000, rentHigh:45000, note:'商業區段，適合開店' },
    { area:'中和區一般社區路段', range:'10-15坪', rentLow:18000, rentHigh:30000, note:'租金較低，但需評估人流量' },
    { area:'中和/永和邊界', range:'10-15坪', rentLow:22000, rentHigh:38000, note:'可兼顧兩區客群' },
];

// ========== 員工薪資行情 (2026年 基本工資：月薪$29,500 / 時薪$196) ==========
const SALARY_REFERENCE = {
    minWageMonthly: 29500,  // 2026年基本工資(月)
    minWageHourly: 196,     // 2026年基本工資(時)
    roles: [
        { title:'工讀生/PT', type:'時薪', low:196, high:210, unit:'元/時', note:'基本工資$196起，多數飲料店開$196-$200' },
        { title:'正職店員', type:'月薪', low:31000, high:36000, unit:'元/月', note:'含勞健保，依經驗而定' },
        { title:'資深店員/副店長', type:'月薪', low:33000, high:40000, unit:'元/月', note:'需獨立開店作業能力' },
        { title:'店長', type:'月薪', low:38000, high:48000, unit:'元/月', note:'底薪+績效獎金，好的店長月收可達$50,000-$60,000' },
        { title:'區域經理/督導', type:'月薪', low:45000, high:60000, unit:'元/月', note:'管理多間店面，通常連鎖體系才有' },
    ]
};

// ========== Checklist Data ==========
const CHECKLIST_DATA = [
    { phase:'第一階段：規劃期（開店前3-6個月）', badge:'規劃', items:[
        '確定開店類型（自創品牌/加盟）','撰寫商業計畫書','確認合夥人與出資比例','申請營業登記與稅籍','確認目標商圈與客群分析',
        '尋找合適店面（建議中和景安/南勢角商圈）','簽訂租約（注意合約條款、是否可做餐飲）','確認品牌名稱與商標註冊','規劃菜單與定價策略','走訪原物料供應商（上統/綺豐/華宏）索取報價',
    ]},
    { phase:'第二階段：裝修期（開店前1-3個月）', badge:'裝修', items:[
        '委託設計師出圖或自行規劃動線','申請室內裝修許可','水電管線配置工程','排水與給水系統安裝（含截油槽）','冷氣空調安裝',
        '招牌設計與施工','吧台與工作區施作','地板、牆面裝修','照明設備安裝','監視器安裝',
    ]},
    { phase:'第三階段：採購期（開店前1-2個月）', badge:'採購', items:[
        '核心設備採購（封口機、果糖機、製冰機等）','冷藏/冷凍設備採購','POS收銀系統採購與設定','淨水與軟水設備安裝','小型器具採購（量杯、雪克杯等）',
        '第一批原物料叫貨（茶葉/果糖/珍珠）','包材（杯子、封膜、吸管）叫貨','制服/圍裙訂製','菜單看板製作','名片、集點卡印製',
    ]},
    { phase:'第四階段：試營運（開店前2-4週）', badge:'試營', items:[
        '員工招募與面試（建議104/小雞上工/店頭張貼）','員工教育訓練（SOP制定）','飲品製作練習與品質確認','POS系統測試與菜單建檔','外送平台上架（UberEats/foodpanda）',
        '社群媒體帳號建立（IG/FB/LINE@）','開幕活動企劃','試營運（邀請親友試飲）','調整口味與出杯流程','申請食品業者登錄（FDA食藥署）',
    ]},
    { phase:'第五階段：正式營運', badge:'開幕', items:[
        '正式開幕（配合促銷活動）','每日營收與成本記錄','每週盤點原物料','每月損益表製作','客戶回饋收集與改善',
        '持續行銷推廣（Google商家/社群經營）','定期設備保養維護（製冰機除垢、淨水器濾心）','員工排班管理優化','新品研發與季節限定','評估是否拓展分店',
    ]},
];
