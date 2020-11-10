import {LinkIcon, WarningOutlineIcon} from '@sanity/icons'
import DetailPreview from 'part:@sanity/components/previews/detail'
import BlockPreview from 'part:@sanity/components/previews/block'
import {boolean, text, select} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'
import {CenteredContainer} from 'part:@sanity/storybook/components'
import React from 'react'
import {PreviewCard, Stack} from './components'

const renderMedia = () => {
  return <img src="http://www.fillmurray.com/300/300" alt="test" />
}

const renderStatus = () => {
  return (
    <span>
      Status <LinkIcon /> <WarningOutlineIcon />
    </span>
  )
}

const renderTitle = (options: {layout: string}) => {
  return (
    <span>
      This <span style={{color: 'green'}}>is</span> a <strong>title</strong>
      &nbsp;in the layout {options.layout}
    </span>
  )
}

const renderSubtitle = () => {
  return (
    <span>
      This is a{' '}
      <strong style={{color: 'red'}}>
        <WarningOutlineIcon />
        subtitle
      </strong>
    </span>
  )
}

const renderDescription = () => {
  return (
    <span>
      This is the{' '}
      <strong style={{color: 'red'}}>
        <WarningOutlineIcon />
        description
      </strong>
    </span>
  )
}

const renderCustomChildren = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            fontSize: '10px',
            textTransform: 'uppercase',
            top: '0',
            right: '0',
            fontWeight: 700,
            boxShadow: '0 0 5px rgba(0,0,0,0.2)',
            backgroundColor: 'yellow',
            padding: '0.2em 3em',
            transform: 'translate(28%, 43%) rotate(45deg)',
          }}
        >
          New
        </div>
      </div>
    </div>
  )
}

const options = {
  functions: 'Functions',
  strings: 'Strings',
  elements: 'Element',
}

export function BlockStory() {
  const propType = select('Type of props', options, 'strings')

  if (propType === 'functions') {
    return (
      <CenteredContainer style={{backgroundColor: 'none'}}>
        <div style={{width: '100%', maxWidth: 350}}>
          <Sanity part="part:@sanity/components/previews/detail" propTables={[DetailPreview]}>
            <Stack>
              <PreviewCard>
                <BlockPreview
                  title={renderTitle}
                  subtitle={renderSubtitle}
                  description={renderDescription}
                  status={renderStatus}
                  media={renderMedia}
                >
                  {boolean('Custom children', false, 'test') && renderCustomChildren()}
                </BlockPreview>
              </PreviewCard>
            </Stack>
          </Sanity>
        </div>
      </CenteredContainer>
    )
  }

  if (propType === 'elements') {
    return (
      <CenteredContainer style={{backgroundColor: 'none'}}>
        <div style={{width: '100%', maxWidth: 350}}>
          <Sanity part="part:@sanity/components/previews/detail" propTables={[DetailPreview]}>
            <Stack>
              <PreviewCard>
                <BlockPreview
                  title={
                    <span>
                      This <span style={{color: 'green'}}>is</span> a <strong>test</strong>
                    </span>
                  }
                  subtitle={
                    <span>
                      This is a <strong style={{color: 'red'}}>subtitle</strong>
                    </span>
                  }
                  description={
                    <span>
                      This is the long the descriptions that should no be to long, beacuse we will
                      cap it
                    </span>
                  }
                  status={
                    <div>
                      <LinkIcon />
                      <WarningOutlineIcon />
                    </div>
                  }
                  media={boolean('Show image', false, 'test') ? renderMedia : undefined}
                >
                  {boolean('Custom children', false, 'test') && renderCustomChildren()}
                </BlockPreview>
              </PreviewCard>
            </Stack>
          </Sanity>
        </div>
      </CenteredContainer>
    )
  }

  return (
    <CenteredContainer style={{backgroundColor: 'none'}}>
      <div style={{width: '100%', maxWidth: 350}}>
        <Sanity part="part:@sanity/components/previews/detail" propTables={[DetailPreview]}>
          <Stack>
            <PreviewCard>
              <BlockPreview
                title={text('title', 'This is the title', 'props')}
                subtitle={text('subtitle', 'This is the subtitle', 'props')}
                description={text('description', 'This is the description', 'props')}
                status={text('status', 'status', 'props')}
                media={renderMedia}
              >
                {boolean('Custom children', false, 'test') && renderCustomChildren()}
              </BlockPreview>
            </PreviewCard>
          </Stack>
        </Sanity>
      </div>
    </CenteredContainer>
  )
}
