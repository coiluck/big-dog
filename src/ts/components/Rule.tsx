import "../../css/rule.css";
import IconWithTooltip from "./IconWithTooltip";

export default function Rule({ setIsRuleOpen }: { setIsRuleOpen: (isOpen: boolean) => void }) {
  return (
    <div className="rule-modal">
      <div className="rule-modal-overlay" onClick={() => setIsRuleOpen(false)} />
      <div className="rule-modal-content">
        <div className="rule-modal-content-header">
          <span>ルール</span>
          <button onClick={() => setIsRuleOpen(false)}>×</button>
        </div>
        <div className="rule-modal-content-body">
          <p>敵を避けながら遠くまで進もう！</p>
          <div className="rule-modal-content-body-item">
            <p className="rule-modal-content-body-item-title">サイズ</p>
            <p className="rule-modal-content-body-item-description">
              プレイヤーは
              <IconWithTooltip imagePath="/big-dog/images/Game/meat.png" size={36} description="肉" />
              を食べると画面右上のパラメータが上昇し、一定の水準に達した場合、サイズが大きくなります。
              <IconWithTooltip imagePath="/big-dog/images/Game/dog/gi_run2.png" size={36} description="いちばん大きい犬" />
              の状態は10秒間のみ持続し、終了後は
              <IconWithTooltip imagePath="/big-dog/images/Game/dog/sm_run2.png" size={36} description="1番小さい犬" />
              に戻ります
            </p>
          </div>
          <div className="rule-modal-content-body-item">
            <p className="rule-modal-content-body-item-title">敵</p>
            <p className="rule-modal-content-body-item-description">
            プレイヤーのサイズによって敵との関係が変化します。
            <br /><br />
            <IconWithTooltip imagePath="/big-dog/images/Game/dog/sm_run2.png" size={48} description="1番小さい犬" />
            : 全ての敵に負けてしまいます。敵を避けながら進もう！
            <br /><br />
            <IconWithTooltip imagePath="/big-dog/images/Game/dog/md_run2.png" size={48} description="中くらいの犬" />
            : <IconWithTooltip imagePath="/big-dog/images/Game/enemy/bee.png" size={36} description="蜂" />
            と
            <IconWithTooltip imagePath="/big-dog/images/Game/enemy/bicycle.png" size={36} description="自転車" />
            に打ち勝つことができます。
            <IconWithTooltip imagePath="/big-dog/images/Game/enemy/f35.png" size={48} description="F35" />
            と
            <IconWithTooltip imagePath="/big-dog/images/Game/enemy/doktor.png" size={24} description="動物病院の先生" />
            には勝てません
            <br /><br />
            <IconWithTooltip imagePath="/big-dog/images/Game/dog/gi_run2.png" size={48} description="いちばん大きい犬" />
            : 全ての敵に勝つことができます。最強を見せつけろ！
            </p>
          </div>
          <div className="rule-modal-content-body-item">
            <p className="rule-modal-content-body-item-title">スコア</p>
            <p className="rule-modal-content-body-item-description">
              <IconWithTooltip imagePath="/big-dog/images/Game/meat.png" size={36} description="肉" />の取得 / 敵を倒すことによってスコアを獲得できます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}