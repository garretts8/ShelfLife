import React, {useState} from 'react';
import './SeventyTwoHourKit.css';

const SeventyTwoHourKit = ({ onClose}) => {
    const [checkedItems, setCheckedItems] = useState({});

    const kitItems = [
        { id: 'water1', item: 'Water bottles (16.9 oz / 500 ml) - 4-5 bottles' },
        { id: 'water2', item: 'Collapsible water bottle (1L)' },
        { id: 'water3', item: 'Water purification tablets' },
        { id: 'water4', item: 'Small folding cup / scoop' },
        { id: 'food1', item: 'High-calorie energy bars - 6-8 bars' },
        { id: 'food2', item: 'Nut-butter packets - 4-6 packets' },
        { id: 'food3', item: 'Tuna or chicken pouches - 2-3 pouches' },
        { id: 'food4', item: 'Trail mix - 1 bag' },
        { id: 'food5', item: 'Instant oatmeal or soup cups - 2-3' },
        { id: 'food6', item: 'Hard candy / electrolyte chews - 1 small bag' },
        { id: 'light1', item: 'Headlamp (with red LED)' },
        { id: 'light2', item: 'Extra AAA/AA batteries - 1 set' },
        { id: 'light3', item: 'Hand-crank/solar AM/FM/NOAA radio' },
        { id: 'light4', item: 'Whistle (with compass)' },
        { id: 'light5', item: 'Power bank (10,000 mAh)' },
        { id: 'light6', item: 'Phone charging cables - 1 set' },
        { id: 'firstaid1', item: 'Small first-aid kit' },
        { id: 'firstaid2', item: 'Prescription medications - 3-day supply' },
        { id: 'firstaid3', item: 'Hand sanitizer (2 oz)' },
        { id: 'firstaid4', item: 'Travel-size toilet paper / wet wipes' },
        { id: 'firstaid5', item: 'Feminine hygiene products - as needed' },
        { id: 'firstaid6', item: 'Mini toothbrush & toothpaste' },
        { id: 'shelter1', item: 'Emergency Mylar blanket' },
        { id: 'shelter2', item: 'Lightweight poncho (or rain jacket)' },
        { id: 'shelter3', item: 'Ultra-light puffy jacket (packable)' },
        { id: 'shelter4', item: 'Work gloves - 1 pair' },
        { id: 'shelter5', item: 'Duct tape (small roll)' },
        { id: 'tools1', item: 'Multi-tool (with pliers and blade)' },
        { id: 'tools2', item: 'Paper map of your local area' },
        { id: 'tools3', item: 'Compass (small baseplate)' },
        { id: 'tools4', item: 'Notepad & pencil' },
        { id: 'tools5', item: 'Cash (small bills - $40-$60)' },
        { id: 'tools6', item: 'Waterproof document bag' }
    ];

    const toggleItem = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const totalItems = kitItems.length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;    

     return (
        <div className="kit-modal-overlay" onClick={onClose}>
            <div className="kit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kit-modal-header">
                    <h2>🎒 72-Hour Emergency Kit</h2>
                    <button className="kit-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="kit-modal-body">
                    <div className="kit-summary">
                        <span>Checked: {checkedCount} / {totalItems} items</span>
                        <button className="print-btn" onClick={() => window.print()}>🖨️ Print</button>
                    </div>

                    <div className="kit-list">
                        {kitItems.map(item => (
                            <label key={item.id} className={`kit-item ${checkedItems[item.id] ? 'checked' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={checkedItems[item.id] || false}
                                    onChange={() => toggleItem(item.id)}
                                />
                                {item.item}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="kit-modal-footer">
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default SeventyTwoHourKit;