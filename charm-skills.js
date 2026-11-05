/* ヨロズモン大戦 チャーム14種：仕様定義（既存ゲームへの接続前） */
export const CHARM_SKILLS = Object.freeze([
{id:"king_blessing",name:"王様のご加護",mode:"start",uses:Infinity,detail:"キングの初期HP・最大HP+1。上限5超過可"},
{id:"endure",name:"ふんばり根性",mode:"fatal",uses:1,detail:"致死ダメージをHP1で耐え、相手の現在ターン終了まで無敵"},
{id:"last_stand",name:"背水の陣",mode:"ally_ko",uses:1,detail:"生存味方が2体になった時、生存者それぞれ通常レベルアップ1回。実際の撃破数は増えない"},
{id:"rival_jump",name:"ライバルジャンプ",mode:"active",uses:1,detail:"移動可能方向の敵1体をAP1で飛び越え、その直後の空きマスに着地"},
{id:"rocket_start",name:"ロケットスタート",mode:"first_roll",uses:1,detail:"最初の自軍ターンのAP+2。上限6"},
{id:"reroll",name:"もういっかい！",mode:"own_roll",uses:1,detail:"自分の出目を振り直し、結果を必ず採用"},
{id:"ap_pool",name:"APプール",mode:"turn_end",uses:1,detail:"未使用APすべてを次の自軍ターンに持ち越し。合計上限なし、再保存不可"},
{id:"opposite",name:"裏の目",mode:"own_roll",uses:1,detail:"出目を7-出目に変更。回転権は変更後の出目で判定"},
{id:"miracle_one",name:"奇跡の一つ星",mode:"roll",uses:Infinity,detail:"出目1のたびAP+1。通常の回転権も維持"},
{id:"reposition",name:"ポジチェン",mode:"pre_battle",uses:1,detail:"両軍配置確認後、自軍の選択済み4体を初期配置範囲内で並べ替え"},
{id:"compass_break",name:"コンパス・ブレイク",mode:"active",uses:1,detail:"自軍ターン中、敵1体を90/180/270度回転。AP消費なし"},
{id:"prank",name:"いたずらっこ",mode:"enemy_roll",uses:1,detail:"相手の出目を振り直させ、振り直し後の結果を採用"},
{id:"friend_will",name:"友の意思",mode:"ally_ko",uses:Infinity,detail:"味方撃破時、生存味方1体を選んで現在HP+1（最大HPまで）"},
{id:"one_team",name:"ワンチーム",mode:"passive",uses:Infinity,detail:"属性を問わず挟撃成立。挟撃ボーナス合計+2"}
]);
export function createCharmState(id){if(!CHARM_SKILLS.some(s=>s.id===id))throw Error("Unknown charm: "+id);return {id,used:0,bankedAp:0,bankExpiresOnTurn:null};}
export function canUseCharm(charm){const spec=CHARM_SKILLS.find(s=>s.id===charm.id);return !!spec&&charm.used<spec.uses;}
export function useCharm(charm){if(!canUseCharm(charm))return false;charm.used++;return true;}
export function rollToAp(roll,charm,firstOwnTurn=false){if(!Number.isInteger(roll)||roll<1||roll>6)throw Error("Invalid die");let ap=roll;if(charm?.id==="miracle_one"&&roll===1)ap++;if(charm?.id==="rocket_start"&&firstOwnTurn)ap=Math.min(6,ap+2);return {ap,canRotate:roll===1};}
export function oppositeRoll(roll){if(!Number.isInteger(roll)||roll<1||roll>6)throw Error("Invalid die");return 7-roll;}
export function saveAp(charm,remainingAp,nextOwnTurn){if(charm.id!=="ap_pool"||!useCharm(charm))return false;charm.bankedAp=Math.max(0,remainingAp);charm.bankExpiresOnTurn=nextOwnTurn;return true;}
export function consumeBank(charm,ownTurn,rolledAp){const bonus=charm.id==="ap_pool"&&charm.bankExpiresOnTurn===ownTurn?charm.bankedAp:0;charm.bankedAp=0;charm.bankExpiresOnTurn=null;return rolledAp+bonus;}
export function triggerLastStand(charm,allies,levelUp){if(charm.id!=="last_stand"||allies.filter(p=>p.hp>0).length!==2||!useCharm(charm))return false;for(const p of allies.filter(p=>p.hp>0))levelUp(p,{virtual:true});return true;}
export function pincerBonus(charm,isPincer,sameAttribute){return !isPincer?0:charm?.id==="one_team"?2:sameAttribute?1:0;}
