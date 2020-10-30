import {DocumentIcon} from '@sanity/icons'
import {Dialog, Text} from '@sanity/ui'
import React from 'react'
import {CreateDocumentList} from './createDocumentList'

interface CreateDocumentDialogProps {
  actions: {icon?: React.ComponentType; key: string}[]
  onClose: () => void
}

export function CreateDocumentDialog(props: CreateDocumentDialogProps) {
  const {actions, onClose} = props

  return (
    <Dialog
      id="create-new-document-dialog"
      onClose={onClose}
      header="Create new document"
      width={3}
    >
      {actions.length > 0 ? (
        <CreateDocumentList
          items={actions.map(action => ({
            ...action,
            icon: action.icon || DocumentIcon,
            onClick: onClose
          }))}
        />
      ) : (
        <Text>No initial value templates are configured.</Text>
      )}
    </Dialog>
  )
}