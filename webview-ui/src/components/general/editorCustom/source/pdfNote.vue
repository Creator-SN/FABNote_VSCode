<template>
    <node-view-wrapper
        class="power-editor-pdf-note-container"
        :class="[{ dark: currentTheme === 'dark' }]"
    >
        <span
            class="power-editor-pdf-note-label"
            contenteditable="false"
            :title="titleText"
            @click.stop.prevent="handleClick"
        >
            <span class="pdf-icon-wrap">
                <img :src="img.barePdf" alt="pdf" />
            </span>
            <i class="label-name">{{ labelText }}</i>
            <i class="ms-Icon ms-Icon--Forward arrow-icon"></i>
        </span>
        <div
            v-if="!hasInnerContent"
            class="power-editor-pdf-note-placeholder"
            contenteditable="false"
        >
            PDF Note
        </div>
        <node-view-content
            class="power-editor-pdf-note-content"
            :class="[{ empty: !hasInnerContent }]"
        />
    </node-view-wrapper>
</template>

<script>
import { NodeViewContent, NodeViewWrapper } from "@tiptap/vue-3";
import barePdf from "../../../../assets/home/bare_pdf.svg";

export default {
    name: "pdfNote",

    components: {
        NodeViewWrapper,
        NodeViewContent,
    },

    data() {
        return {
            img: {
                barePdf,
            },
        };
    },

    props: {
        editor: {
            type: Object,
            default: null,
        },
        node: {
            type: Object,
            required: true,
        },
        decorations: {
            type: Array,
            default: () => [],
        },
        selected: {
            type: Boolean,
            default: false,
        },
        extension: {
            type: Object,
            default: null,
        },
        getPos: {
            type: Function,
            default: null,
        },
        updateAttributes: {
            type: Function,
            default: null,
        },
        deleteNode: {
            type: Function,
            default: null,
        },
    },

    computed: {
        currentTheme() {
            return this.editor?.storage?.defaultStorage?.theme || "light";
        },
        labelText() {
            return this.node?.attrs?.content || "PDF Note";
        },
        titleText() {
            return `PDF Clip: ${this.labelText}`;
        },
        hasInnerContent() {
            return (this.node?.content?.size || 0) > 0;
        },
    },

    methods: {
        handleClick() {
            // Intentionally disabled in this local editor integration.
        },
    },
};
</script>

<style lang="scss">
.power-editor-pdf-note-container {
    position: relative;
    background: rgba(255, 255, 255, 0);
    border: 1px solid rgba(200, 200, 200, 0);
    border-radius: 0.5rem;
    margin: 1rem 0;
    transition: all 0.3s;
    overflow: hidden;
    z-index: 0;
    isolation: isolate;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        padding: 1.5px;
        border-radius: inherit;
        background: linear-gradient(
            120deg,
            rgba(255, 105, 117, 1),
            rgba(220, 62, 72, 1),
            #8b5cf6,
            #7c3cff
        );
        background-size: 300% 300%;
        animation: border-flow 3s ease both;
        z-index: -1;

        -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        mask-composite: exclude;
    }

    @keyframes border-flow {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @keyframes pdfIconPop {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
        }
    }

    &.dark {
        .power-editor-pdf-note-content {
            border: 1px dashed rgba(200, 200, 200, 0.2);

            &:hover {
                border-color: rgba(200, 200, 200, 0.6);
            }
        }
    }

    .power-editor-pdf-note-label {
        @include Vcenter;

        position: absolute;
        top: -3px;
        right: 0px;
        max-width: calc(100% - 50px);
        margin-right: 16px;
        padding: 5px 12px;
        gap: 5px;
        background: linear-gradient(
            90deg,
            rgba(255, 105, 117, 1) 0%,
            rgba(220, 62, 72, 1) 100%
        );
        font-size: 0.6rem;
        letter-spacing: 1px;
        font-weight: bold;
        text-transform: uppercase;
        color: #fff;
        border-radius: 0 0 8px 8px;
        transition: all 0.6s;
        user-select: none;
        transition:
            width 0.24s ease-out,
            background-position 0.28s ease-out,
            filter 0.28s ease-out,
            transform 0.28s ease-out,
            box-shadow 0.28s ease-out;
        z-index: 2;

        &:hover {
            background-position: 100% 50%;
            filter: brightness(1.08) saturate(1.08);
        }

        &:active {
            filter: brightness(1.02) saturate(1.04);
            box-shadow:
                0 2px 8px rgba(220, 62, 72, 0.28),
                0 0 0 1px rgba(255, 120, 132, 0.24) inset;
        }

        .pdf-icon-wrap {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
            border-radius: 50%;
            background: #fff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 2px;
            transform: scale(0);
            animation: pdfIconPop 0.26s ease-out 0.02s forwards;

            img {
                width: 12px;
                height: 12px;
                object-fit: contain;
            }
        }

        .label-name {
            @include nowrap;

            flex: 1;
            font-style: normal;
            transition: width 0.24s ease-out;
        }

        .arrow-icon {
            transform: scale(0.6);
        }
    }

    .power-editor-pdf-note-content {
        margin: 35px 10px 10px;
        padding: 8px;
        border: 1px dashed rgba(120, 120, 120, 0.2);
        border-radius: 8px;
        transition: all 0.6s;
        cursor: text;

        &:hover {
            border-color: rgba(120, 120, 120, 0.3);
        }

        &.empty {
            min-height: 18px;
        }
    }

    .power-editor-pdf-note-placeholder {
        margin: 35px 10px 10px;
        padding: 8px;
        border: 1px dashed rgba(120, 120, 120, 0.12);
        border-radius: 8px;
        color: rgba(120, 120, 120, 0.9);
        font-size: 12px;
        line-height: 1.5;
        user-select: none;
    }
}
</style>
