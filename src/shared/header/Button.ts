import { UIComponent, UIStateType, UIProp } from "./UIComponent";

interface ButtonProps extends UIProp {
    Text: string;
}

export class Button extends UIComponent {
    private roactElement: Roact.Element | undefined;

    constructor(
        public Instance: Instance,
        private props: ButtonProps,
        name?: string,
        debugMode?: boolean,
        colors?: Map<string, Color3>
    ) {
        super(Instance, name, debugMode, colors);

        // Configurar estados
        this.addState(UIStateType.IDLE, {
            Properties: new Map([
                ["main", new Map([["BackgroundColor3", new Color3(1, 1, 1)]])],
                ["Title", new Map([["TextColor3", new Color3(0, 0, 0)]])],
            ]),
            TweenInfo: new TweenInfo(0.5),
        });
        this.addState(UIStateType.HOVER, {
            Properties: new Map([
                ["main", new Map([["BackgroundColor3", new Color3(0.8, 0.8, 0.8)]])],
                ["Title", new Map([["TextColor3", new Color3(0.2, 0.2, 0.2)]])],
            ]),
            TweenInfo: new TweenInfo(0.5),
        });

        // Crear el elemento Roact
        this.roactElement = this.render();
        Roact.mount(this.roactElement, this.Instance);
    }

    private render(): Roact.Element {
        const isDisabled = this.isInState(UIStateType.DISABLED);
        const isActive = this.isInState(UIStateType.ACTIVE);

        return (
            <textbutton
                Text={this.props.Text}
                Position={this.props.Position}
                Size={this.props.Size}
                Active={!isDisabled}
                BackgroundColor3={isActive ? new Color3(0, 1, 0) : new Color3(1, 0, 0)}
                Event={{
                    MouseButton1Click: () => {
                        this.setCurrentState(UIStateType.ACTIVE);
                        this.props.OnClick();
                    },
                    MouseEnter: () => this.setCurrentState(UIStateType.HOVER),
                    MouseLeave: () => this.setCurrentState(UIStateType.IDLE),
                }}
            >
                {this.props.Children}
            </textbutton>
        );
    }
}